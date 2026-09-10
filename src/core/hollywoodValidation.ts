import { flattenParticipants } from './starPower.js'
import { sameContractTerms } from './industryEmployment.js'
import { HOLLYWOOD_STARTING_MANIFEST, RIVAL_CREDIT_ROLES, RIVAL_TEAM_ROLES } from './hollywoodStartingData.js'
import { persistedConceptIds, persistedProductionIds } from './productionIdentity.js'
import { weeklySalary, terminationCost } from './employment.js'
import type { GameState } from './types.js'
import { CAMPAIGN_CALENDAR_POLICY, campaignDate, historicalDate, RIVAL_ARRIVAL_WEEKS } from './calendar.js'
import { RIVAL_MONEY_KINDS, rivalCapacityOpex, rivalStartingFacilities, hollywoodWorldKey } from './hollywood.js'
import {openTheatricalRun} from './economy.js'
import { GENRE_ORDER, TUNING } from './tuning.js'
import { assertStudioOperationsInvariants } from './operations.js'
import { assertScriptDevelopmentInvariants, activeScriptWriterAssignments } from './scriptDevelopment.js'
import { productionCompanyTalentIds } from './productionPeople.js'
import type { GameStateV18, Production, StudioOperations, ScriptDevelopment } from './types.js'
import type { HollywoodState, IndustryFilm } from './hollywoodTypes.js'

function requireFact(condition: unknown, detail: string): asserts condition {
  if (!condition) throw new Error(`Hollywood save: ${detail}`)
}
function exact(value: unknown, keys: readonly string[]): asserts value is Record<string, unknown> {
  requireFact(value !== null && typeof value === 'object' && !Array.isArray(value), 'object required')
  requireFact(Object.keys(value).length === keys.length && keys.every(k => Object.hasOwn(value,k)),`exact keys required: ${keys.join(',')}`)
}
function number(value: unknown, min = -Infinity, max = Infinity): asserts value is number {
  requireFact(typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max,'finite bounded number required')
}
function integer(value: unknown, min = 0): asserts value is number {
  number(value,min); requireFact(Number.isSafeInteger(value),'safe integer required')
}
function text(value: unknown): asserts value is string {
  requireFact(typeof value === 'string' && value.length > 0 && value.length <= 256,'bounded text required')
}
function list(value: unknown): asserts value is unknown[] { requireFact(Array.isArray(value),'array required') }
function standing(value: unknown) {
  exact(value,['audienceAwareness','industryPrestige','commercialConfidence'])
  for (const n of Object.values(value)) number(n,0,100)
}
function close(a: number,b: number) { return Math.abs(a-b) <= 1e-7 * Math.max(1,Math.abs(a),Math.abs(b)) }

export type HollywoodLeafValidators = {
  concept: (value: unknown) => void
  contract: (value: unknown) => void
  film: (value: unknown, concepts: ReadonlySet<string>) => void
  production: (value: unknown, concepts: ReadonlySet<string>) => void
  run: (value: unknown, films: ReadonlySet<string>, concepts: ReadonlySet<string>) => void
  career: (value: unknown, films: ReadonlySet<string>) => void
  operations: (value: unknown, productions: Production[]) => StudioOperations
  development: (value: unknown) => ScriptDevelopment
}

/** Strict additive root, using the same frozen leaf validators as player data. */
export function validateHollywood(value: unknown, state: GameStateV18, shared: HollywoodLeafValidators): asserts value is HollywoodState | null {
  campaignDate(state.market.tick)
  if (value === null) {
    // Explicit non-player corpus control; native New Game always starts founding.
    requireFact(state.founding === null,'a founding campaign requires its industry')
    return
  }
  exact(value,['version','calendarPolicy','startingManifest','origin','originWeek','worldId','playerStudioId',
    'identities','businesses','employment','activeEmploymentOrdinals','concepts','films','careerEvents','receipts','nextReceipt','chart','previousChart'])
  requireFact(value.version === 1 && value.calendarPolicy === CAMPAIGN_CALENDAR_POLICY &&
    value.startingManifest === 'living-hollywood-start/v1','unknown root/manifest/calendar policy')
  requireFact(value.origin === 'fresh' || value.origin === 'migration','unknown initialization provenance')
  integer(value.originWeek); requireFact(value.originWeek <= state.market.tick,'future origin')
  if (value.origin === 'fresh') requireFact(value.originWeek === 0,'fresh campaign starts at week zero')
  text(value.worldId); text(value.playerStudioId); integer(value.nextReceipt)
  for (const key of ['identities','businesses','employment','activeEmploymentOrdinals','concepts','films','careerEvents','receipts']) list(value[key])
  const h = value as unknown as HollywoodState
  const worldKey = hollywoodWorldKey(state.seed)
  requireFact(h.worldId === `world-${worldKey}`,'world identity differs from its seed')
  const studios = new Map(h.identities.map(s => [s.studioId,s]))
  requireFact(studios.size === 10 && h.identities.length === 10,'exactly player plus nine reserved studios')
  const names = new Set<string>()
  for (const [index,s] of h.identities.entries()) {
    exact(s,['studioId','role','row','name','mark','color','founding','eligibleWeek','enteredWeek','recordedFromWeek'])
    text(s.studioId); text(s.name); text(s.mark); text(s.color)
    const baseId = `studio-${worldKey}-${index === 0 ? 'player' : `r${String(index).padStart(2,'0')}`}`
    requireFact(s.studioId === baseId || (s.studioId.startsWith(`${baseId}-`) && /^[1-9]\d*$/.test(s.studioId.slice(baseId.length+1))), 'reserved studio identity differs from its world')
    requireFact(!state.talent.some(t=>t.id===s.studioId) && !state.concepts.some(c=>c.id===s.studioId), 'studio identity collides with an existing person or concept')
    if(index > 0) {
      const template=HOLLYWOOD_STARTING_MANIFEST.studios[index-1]!
      requireFact(s.name===template.name&&s.mark===template.mark&&s.color===template.color,'studio display identity differs from starting manifest')
    }
    requireFact(!names.has(s.name),'duplicate studio name'); names.add(s.name)
    requireFact(s.row === index && s.role === (index === 0 ? 'player' : 'rival'),'stable registry row/role')
    requireFact(s.eligibleWeek === (index === 0 ? 0 : RIVAL_ARRIVAL_WEEKS[index-1]),'fixed arrival policy mismatch')
    if (s.founding !== null) {
      if (s.founding.kind === 'beforeCampaign') { exact(s.founding,['kind','year']); historicalDate(s.founding.year) }
      else { exact(s.founding,['kind','week']); requireFact(s.founding.kind === 'campaign','unknown date'); integer(s.founding.week) }
    }
    if (s.enteredWeek === null) {
      requireFact(s.recordedFromWeek === null && s.eligibleWeek > state.market.tick,'overdue or partially entered studio')
      requireFact(!h.businesses.some(b => b.studioId === s.studioId),'inactive identity has business')
    } else {
      integer(s.enteredWeek); integer(s.recordedFromWeek)
      requireFact(s.enteredWeek >= s.eligibleWeek && s.enteredWeek <= state.market.tick,'invalid entry chronology')
      if (index > 0) requireFact(s.recordedFromWeek === s.enteredWeek,'entry recording boundary mismatch')
      if (index > 0) requireFact(s.enteredWeek===Math.max(s.eligibleWeek,h.originWeek),'studio entry differs from its actual due boundary')
      if (h.origin === 'migration' && index > 0) requireFact(s.enteredWeek >= h.originWeek && s.founding?.kind !== 'beforeCampaign','fabricated migration past')
    }
  }
  requireFact(h.identities[0]!.studioId === h.playerStudioId,'player identity mismatch')
  const talent = new Map(state.talent.map(t => [t.id,t]))
  const concepts = persistedConceptIds({...state,hollywood:null} as GameState)
  for (const c of h.concepts) { shared.concept(c); requireFact(!concepts.has(c.id),'concept identity collision'); concepts.add(c.id) }
  const hollywoodConcepts=new Map(h.concepts.map(c=>[c.id,c]))
  const filmIds = persistedProductionIds({...state,hollywood:null} as GameState)
  const liveIds = new Set<string>()
  const films = new Map<string,IndustryFilm>()
  for (const f of h.films) {
    requireFact(f && typeof f === 'object','film object required')
    const common = ['filmId','studioId','conceptId','title','genre','credits','provenance']
    if (f.provenance === 'authored-start/v1') {
      exact(f,[...common,'released','criticScore','audienceScore','openingGross','totalGross','settled'])
      exact(f.released,['kind','year']); historicalDate(f.released.year)
      requireFact(f.released.kind === 'beforeCampaign' && f.settled === true && h.origin === 'fresh','invalid authored provenance')
      const s = studios.get(f.studioId)
      requireFact(s && s.row > 0 && s.row <= 4 && s.founding?.kind === 'beforeCampaign' && s.founding.year <= f.released.year,'authored film before company founding')
      requireFact(!concepts.has(f.conceptId),'authored concept collision'); concepts.add(f.conceptId)
      const template = HOLLYWOOD_STARTING_MANIFEST.studios[s.row-1]!
      const index = template.films!.findIndex(row => row[0] === f.title)
      const authored = template.films![index]
      requireFact(authored && f.filmId === `${s.studioId}:historical-film:${index}` &&
        f.conceptId === `${s.studioId}:historical-concept:${index}` &&
        JSON.stringify([f.title,f.released.year,f.genre,f.criticScore,f.audienceScore,f.openingGross,f.totalGross]) === JSON.stringify(authored),
        'authored film differs from canonical starting manifest')
      requireFact(f.credits.every((c,i) => c.role === RIVAL_CREDIT_ROLES[i] && c.name === template.names![i] &&
        talent.get(c.talentId)?.role === RIVAL_TEAM_ROLES[i] && h.employment.some(e=>e.studioId===s.studioId&&e.reason==='entry'&&e.terms.talentId===c.talentId&&e.terms.startWeek===0)), 'authored credit differs from canonical starting manifest')
      number(f.criticScore,0,100); number(f.audienceScore,0,100); number(f.openingGross,0); number(f.totalGross,f.openingGross)
    } else {
      exact(f,[...common,'scriptProjectId','result','directCommitment','studioRevenueReceived','settledWeek','releaseCommitmentId'])
      requireFact(f.provenance === 'simulation/v1','unknown film provenance')
      shared.film(f.result,concepts); number(f.directCommitment,0); number(f.studioRevenueReceived,0)
      text(f.scriptProjectId); text(f.releaseCommitmentId)
      requireFact(f.result.productionId === f.filmId && f.result.conceptId === f.conceptId,'film result identity mismatch')
      requireFact(f.result.releaseTick >= studios.get(f.studioId)!.enteredWeek! && f.result.releaseTick <= state.market.tick,'invalid live release chronology')
      if (f.settledWeek !== null) { integer(f.settledWeek); requireFact(f.settledWeek >= f.result.releaseTick && f.settledWeek <= state.market.tick,'invalid settlement') }
      liveIds.add(f.filmId)
    }
    text(f.filmId); text(f.conceptId); text(f.title); requireFact(GENRE_ORDER.includes(f.genre),'unknown genre')
    requireFact(studios.get(f.studioId)?.enteredWeek !== null && studios.has(f.studioId),'film owner inactive/unknown')
    requireFact(!filmIds.has(f.filmId),'duplicate film identity'); filmIds.add(f.filmId); films.set(f.filmId,f)
    list(f.credits); const people = new Set<string>()
    for (const credit of f.credits) {
      exact(credit,['talentId','role','name']); text(credit.name)
      requireFact(talent.get(credit.talentId)?.name === credit.name,'credit name differs from its exact person')
      requireFact(talent.has(credit.talentId) && !people.has(credit.talentId),'unknown or duplicated credit'); people.add(credit.talentId)
      requireFact(['writer','director','lead','antagonist','support','craft'].includes(credit.role),'unknown credit role')
    }
    requireFact(f.credits.length === 6 && new Set(f.credits.map(c => c.role)).size === 6,'complete canonical six-person credits required')
  }
  const contractIds = new Set<string>()
  const contractById = new Map(h.employment.map(e=>[e.contractId,e]))
  const employmentByPerson = new Map<string,typeof h.employment>()
  for(const e of h.employment){const rows=employmentByPerson.get(e.terms.talentId)??[];rows.push(e);employmentByPerson.set(e.terms.talentId,rows)}
  const intervals = new Map<string,[number,number][]>(); const employed = new Set(state.contracts.filter(c => c.startWeek <= state.market.tick && state.market.tick < c.endWeekExclusive).map(c => c.talentId))
  for (const [ordinal,e] of h.employment.entries()) {
    exact(e,['contractId','studioId','terms','endedWeek','reason']); text(e.contractId)
    requireFact(!contractIds.has(e.contractId),'contract identity collision'); contractIds.add(e.contractId)
    const studio = studios.get(e.studioId); requireFact(studio?.enteredWeek !== null && studio,'contract owner inactive/unknown')
    shared.contract(e.terms)
    const player=e.studioId===h.playerStudioId
    requireFact(e.contractId===`${e.studioId}:contract:${e.terms.talentId}:${e.terms.startWeek}${player?`:player-${ordinal}`:''}`,'contract identity differs from actual interval start')
    requireFact(talent.has(e.terms.talentId) && (e.terms.startWeek >= studio.enteredWeek! || (player&&e.reason==='existing-player-contract'&&h.origin==='migration')) && e.terms.startWeek <= state.market.tick,'unknown person or invalid employment chronology')
    requireFact((player?['renewal','player-contract','existing-player-contract']:['entry','renewal','replacement']).includes(e.reason),'unknown employment cause')
    if(e.reason==='existing-player-contract')requireFact(h.origin==='migration'&&e.terms.startWeek<=h.originWeek&&e.terms.endWeekExclusive>h.originWeek,'invalid observed migration contract')
    if (e.endedWeek !== null) { integer(e.endedWeek); requireFact(e.endedWeek >= e.terms.startWeek && e.endedWeek <= e.terms.endWeekExclusive && e.endedWeek <= state.market.tick,'invalid contract end') }
    const end = e.endedWeek ?? e.terms.endWeekExclusive
    const prior = intervals.get(e.terms.talentId) ?? []
    requireFact(prior.every(([a,b]) => end <= a || e.terms.startWeek >= b),'overlapping industry employers')
    prior.push([e.terms.startWeek,end]); intervals.set(e.terms.talentId,prior)
    if (e.studioId !== h.playerStudioId && e.terms.startWeek <= state.market.tick && state.market.tick < end) {
      requireFact(!employed.has(e.terms.talentId),'double employer'); employed.add(e.terms.talentId)
      requireFact(!state.founding?.applicantIds.includes(e.terms.talentId),'rival stole founding applicant')
    }
    if(player&&e.endedWeek===null&&end>state.market.tick)requireFact(state.contracts.some(c=>sameContractTerms(c,e.terms)),'player employment differs from actual contract')
  }
  requireFact(new Set(h.activeEmploymentOrdinals).size===h.activeEmploymentOrdinals.length,'duplicate employment index')
  for(const i of h.activeEmploymentOrdinals){integer(i);requireFact(i<h.employment.length,'employment index out of bounds')}
  for(const [i,e] of h.employment.entries()) requireFact(h.activeEmploymentOrdinals.includes(i)===(e.endedWeek===null&&e.terms.endWeekExclusive>state.market.tick), 'active employment index differs from contract interval')
  const businesses = new Set<string>(); const productionIds = new Set([...filmIds,...state.studio.activeProductions.map(p => p.id)])
  const conceptOwners = new Set<string>()
  const assignments=new Map<string,string>()
  const claimAssignment=(personId:string,workId:string)=>{
    requireFact(!assignments.has(personId),`person ${personId} has simultaneous active assignments`)
    assignments.set(personId,workId)
  }
  const verifyParticipants=(p:Production,required:boolean)=>{
    const expected=[{id:p.writerId,role:'writer',discipline:'writing'},{id:p.directorId,role:'director',discipline:'directing'},
      ...(['lead','antagonist','support'] as const).map(role=>({id:p.cast[role],role,discipline:'acting'})),
      ...p.craftIds.map(id=>({id,role:'craft',discipline:'craft'}))]
    requireFact(new Set(expected.map(e=>e.id)).size===expected.length,'one person fills more than one production role')
    requireFact(!required||p.participants!==undefined,'rival production requires frozen participants')
    if(p.participants){const actual=flattenParticipants(p.participants)
      requireFact(actual.length===expected.length&&actual.every((a,i)=>{
        const e=expected[i]!;return a.talentId===e.id&&a.role===e.role&&a.discipline===e.discipline&&a.name===talent.get(e.id)?.name
      }),'frozen participants differ from the production company and screenplay credit')
    }
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
      number(p.opening); number(p.closing); exact(p.movements,RIVAL_MONEY_KINDS)
      for (const [kind,n] of Object.entries(p.movements)) number(n,kind === 'studioRevenue' ? 0 : -Infinity,kind === 'studioRevenue' ? Infinity : 0)
      requireFact(close(balance,p.opening) && close(p.opening+Object.values(p.movements).reduce((a,n)=>a+n,0),p.closing),'unreconciled money')
      balance=p.closing
    }
    requireFact(close(balance,b.account.cash),'cash differs from reconciliation')
    const template = HOLLYWOOD_STARTING_MANIFEST.studios[studios.get(b.studioId)!.row-1]!
    requireFact(b.account.openingBalance === template.capital,'opening balance differs from entry endowment')
    const movements = Object.fromEntries(RIVAL_MONEY_KINDS.map(kind => [kind,b.account.periods.reduce((sum,p)=>sum+p.movements[kind],0)])) as Record<string,number>
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
    const ownedFilms = h.films.filter(f=>f.studioId===b.studioId && f.provenance==='simulation/v1')
    const ownedFilmById=new Map(ownedFilms.map(f=>[f.filmId,f]))
    requireFact(close(movements.studioRevenue!, ownedFilms.reduce((sum,f)=>sum+(f.provenance==='simulation/v1'?f.studioRevenueReceived:0),0)), 'studio revenue does not reconcile')
    list(b.productions); list(b.runs); list(b.projects)
    for (const p of b.productions) {
      shared.production(p,concepts); requireFact(!productionIds.has(p.id),'production identity collision'); productionIds.add(p.id)
      verifyParticipants(p,true)
      const script=b.development.projects.find(s=>s.productionId===p.id)
      requireFact(script?.writerId===p.writerId,'production writer differs from its costed screenplay')
      for(const id of [p.writerId,...productionCompanyTalentIds([p])]){
        const at=id===p.writerId?script!.commissionedWeek:p.startTick
        requireFact(employed.some(e=>e.terms.talentId===id&&e.terms.startWeek<=at&&at<(e.endedWeek??e.terms.endWeekExclusive)), 'rival production lacks its historical employer authority')
      }
    }
    for(const a of activeScriptWriterAssignments(b.development,h.concepts))claimAssignment(a.talentId,`${b.studioId}:${a.projectId}`)
    list(b.activeScriptOrdinals);list(b.activeRunFilmOrdinals)
    requireFact(b.activeScriptOrdinals.length<=2 && new Set(b.activeScriptOrdinals).size===b.activeScriptOrdinals.length, 'bounded unique active screenplay index')
    for(const i of b.activeScriptOrdinals){integer(i);requireFact(i<b.development.projects.length,'screenplay index out of bounds')}
    for(const i of b.activeRunFilmOrdinals){integer(i);requireFact(i<h.films.length,'run film index out of bounds')}
    for(const [ordinal,p] of b.development.projects.entries()) requireFact(b.activeScriptOrdinals.includes(ordinal)===(p.status!=='produced'), 'active screenplay index differs from lifecycle')
    for(const [i,run] of b.runs.entries()) requireFact(h.films[b.activeRunFilmOrdinals[i]!]?.filmId===run.productionId, 'active run index differs from film identity')
    requireFact(b.activeRunFilmOrdinals.length===b.runs.length,'active run index size')
    shared.operations(b.operations,b.productions); shared.development(b.development)
    const costedFacilities=rivalStartingFacilities(b.studioId)
    requireFact(b.operations.facilities.length===costedFacilities.length&&b.operations.facilities.every((f,i)=>{
      const expected=costedFacilities[i]!;return f.id===expected.id&&f.name===expected.name&&f.capability===expected.capability&&f.capacity===expected.capacity
    }), 'rival facilities differ from their costed configuration')
    assertStudioOperationsInvariants(b.operations,b.productions,{facilityPolicy:'configured'})
    const ownedConcepts = b.development.projects.map(p=>{const c=hollywoodConcepts.get(p.conceptId);requireFact(c,'screenplay concept owner missing');return c})
    assertScriptDevelopmentInvariants(b.development,{currentWeek:state.market.tick,concepts:ownedConcepts,talent:state.talent,
      contracts:employed.filter(e=>e.endedWeek===null).map(e=>e.terms),
      operations:b.operations,activeProductions:b.productions,
      releasedFilms:ownedFilms.flatMap(f=>f.provenance==='simulation/v1'?[f.result]:[])})
    exact(b.releaseAuthority,['commitments']); list(b.releaseAuthority.commitments)
    for (const c of b.releaseAuthority.commitments) {
      exact(c,['productionId','commitmentId','committedAtWeek']); integer(c.committedAtWeek)
      requireFact(c.commitmentId === `release-commitment-${c.productionId}` && b.productions.some(p=>p.id===c.productionId && p.remainingTicks===1),'invalid release commitment')
    }
    for (const [ordinal,p] of b.projects.entries()) {
      exact(p,['scriptProjectId','conceptId','conceptOrdinal','productionId','development','production','marketing','announcedWeek'])
      const script=b.development.projects[ordinal]
      requireFact(script?.id===p.scriptProjectId && script.conceptId===p.conceptId && script.productionId===p.productionId, 'project cost ordinal, concept or production link mismatch')
      integer(p.conceptOrdinal);requireFact(h.concepts[p.conceptOrdinal]?.id===p.conceptId,'project concept index mismatch')
      requireFact(!conceptOwners.has(p.conceptId),'original screenplay concept has more than one costed owner');conceptOwners.add(p.conceptId)
      number(p.development,0); number(p.production,0); number(p.marketing,0)
      requireFact(p.productionId===null ? p.announcedWeek===null&&p.production===0&&p.marketing===0 : p.announcedWeek!==null,'paid production lost its actual announcement boundary')
      if(p.announcedWeek!==null) {integer(p.announcedWeek);requireFact(p.announcedWeek<=state.market.tick,'future announcement')}
      const production=p.productionId===null?undefined:activeProductionById.get(p.productionId)
      if(production)requireFact(production.startTick===p.announcedWeek&&close(production.budget.negative,p.production)&&close(production.budget.marketing,p.marketing),'active production budget or date differs from paid commitment')
    }
    const ownedIds = new Set(ownedFilms.map(f=>f.filmId))
    const costs = new Map<string,(typeof b.projects)[number]>()
    for(const p of b.projects) {
      requireFact(!costs.has(p.scriptProjectId),'duplicate project cost owner');costs.set(p.scriptProjectId,p)
      requireFact(p.productionId === null || activeProductionById.get(p.productionId)?.conceptId===p.conceptId ||
        ownedFilmById.get(p.productionId)?.conceptId===p.conceptId, 'costed production missing actual owner')
    }
    requireFact(costs.size === b.development.projects.length, 'development project missing cost authority')
    const runs = new Set<string>()
    for (const run of b.runs) {
      shared.run(run,ownedIds,concepts); requireFact(!runs.has(run.productionId),'duplicate run');runs.add(run.productionId)
      const film=films.get(run.productionId);requireFact(film?.provenance==='simulation/v1','run owner missing')
      const expected=openTheatricalRun(film.result,film.result.boxOffice.opening,film.result.boxOffice.opening>0?film.result.boxOffice.total/film.result.boxOffice.opening:1,film.result.releaseTick)
      const elapsed=Math.min(expected.totalWeeks,state.market.tick-film.result.releaseTick)
      const gross=expected.weeklyGross.slice(0,elapsed).reduce((a,b)=>a+b,0)
      requireFact(run.weekIndex===elapsed&&run.status==='active'&&run.weekIndex<run.totalWeeks&&run.totalWeeks===expected.totalWeeks&&run.releaseTick===expected.releaseTick&&run.conceptId===expected.conceptId&&run.studioShare===expected.studioShare&&run.economyModelVersion===expected.economyModelVersion&&JSON.stringify(run.weeklyGross)===JSON.stringify(expected.weeklyGross)&&close(run.cumulativeGrossPaid,gross)&&close(run.cumulativeStudioRevenuePaid,gross*expected.studioShare)&&close(film.studioRevenueReceived,run.cumulativeStudioRevenuePaid), 'theatrical run differs from canonical schedule or paid prefix')
    }
    for (const f of ownedFilms) if(f.provenance==='simulation/v1') {
      const cost=costs.get(f.scriptProjectId)
      const script=scriptById.get(f.scriptProjectId)
      requireFact(script?.status==='produced' && script.productionId===f.filmId && cost?.productionId===f.filmId &&
        cost.conceptId===f.conceptId && close(f.directCommitment,cost.development+cost.production+cost.marketing), 'live film lacks its costed completed project')
      requireFact(f.releaseCommitmentId===`release-commitment-${f.filmId}`, 'live film lacks canonical release commitment')
      for(const credit of f.credits) {
        const at=credit.role==='writer'?script!.commissionedWeek:cost!.announcedWeek!
        requireFact(employmentForPerson.get(credit.talentId)?.some(e=>e.terms.startWeek<=at&&at<(e.endedWeek??e.terms.endWeekExclusive)), 'archived film credit lacks historical employer authority')
      }
      requireFact((f.settledWeek===null) === runs.has(f.filmId),'live/settled film run mismatch')
      if(f.settledWeek!==null){const run=openTheatricalRun(f.result,f.result.boxOffice.opening,f.result.boxOffice.opening>0?f.result.boxOffice.total/f.result.boxOffice.opening:1,f.result.releaseTick)
        requireFact(f.settledWeek===f.result.releaseTick+run.totalWeeks-1&&close(f.studioRevenueReceived,run.weeklyGross.reduce((a,b)=>a+b*run.studioShare,0)), 'settled film revenue or date differs from canonical run')}
      requireFact(f.result.participants && f.result.directorId===f.result.participants.director.talentId &&
        f.credits.length===flattenParticipants(f.result.participants).length && f.credits.every((c,i)=>{
          const p=flattenParticipants(f.result.participants!)[i]!
          const discipline=c.role==='writer'?'writing':c.role==='director'?'directing':c.role==='craft'?'craft':'acting'
          return p.talentId===c.talentId&&p.role===c.role&&p.name===c.name&&p.discipline===discipline
        }), 'live credit differs from release result')
    }
  }
  requireFact(businesses.size === h.identities.filter(s=>s.role==='rival'&&s.enteredWeek!==null).length,'entry missing business')
  requireFact(conceptOwners.size===h.concepts.length,'original screenplay concept has no costed owner')
  const events = new Set<string>()
  for (const e of h.careerEvents) {
    shared.career(e,liveIds); requireFact(!events.has(e.eventId),'duplicate career event'); events.add(e.eventId)
    const f=films.get(e.filmId); requireFact(f?.provenance==='simulation/v1' && f.credits.some(c=>c.talentId===e.talentId&&c.role===e.role),'career credit does not match live film')
    requireFact(e.eventId===`${e.filmId}:${e.talentId}`&&e.filmTitle===f.title&&e.releaseWeek===f.result.releaseTick&&e.genre===f.genre&&e.realizedOpening===f.result.boxOffice.opening&&e.realizedTotal===f.result.boxOffice.total&&e.criticScore===f.result.criticScore,'career identity or frozen film facts mismatch')
  }
  requireFact(h.careerEvents.length===liveIds.size*6,'live industry film missing its six shared career consequences')
  const businessById=new Map(h.businesses.map(b=>[b.studioId,b]))
  const costByProduction=new Map(h.businesses.flatMap(b=>b.projects.flatMap(p=>p.productionId===null?[]:[[p.productionId,{studioId:b.studioId,cost:p}] as const])))
  const receiptGroups=new Map<string,typeof h.receipts>()
  const grouped=(kind:string,id:string)=>receiptGroups.get(`${kind}:${id}`)??[]
  const receiptIds=new Set<string>(); let priorWeek=h.originWeek
  for (const r of h.receipts) {
    const base=['eventId','week','studioId']
    const extra = {studioEntered:['entryKey','origin'],employment:['talentId','fromStudioId','toStudioId','contractId','reason'],filmAnnounced:['productionId','conceptId'],filmReleased:['productionId','conceptId','before','after'],filmSettled:['productionId']}[r.kind]
    requireFact(extra,'unknown receipt kind'); exact(r,[...base,'kind',...extra])
    integer(r.week); requireFact(r.week>=priorWeek&&r.week<=state.market.tick,'receipt chronology'); priorWeek=r.week
    const owner=studios.get(r.studioId)
    requireFact(owner&&owner.enteredWeek!==null&&owner.enteredWeek<=r.week,'unknown or not-yet-entered receipt studio'); text(r.eventId)
    requireFact(!receiptIds.has(r.eventId),'duplicate receipt'); receiptIds.add(r.eventId)
    requireFact(/^industry-event-\d+$/.test(r.eventId) && Number(r.eventId.slice(15)) < h.nextReceipt,'receipt high water mark')
    if(r.kind==='employment') {
      const interval=contractById.get(r.contractId)
      requireFact(interval&&interval.terms.talentId===r.talentId&&interval.studioId===r.studioId,'unknown or inconsistent employment receipt subject')
      if(r.toStudioId===null)requireFact(r.fromStudioId===r.studioId&&interval.endedWeek===r.week&&
        (r.reason==='expiry'&&interval.terms.endWeekExclusive===r.week || r.reason==='termination'&&r.studioId===h.playerStudioId&&r.week<interval.terms.endWeekExclusive),'employment end receipt differs from actual end')
      else {
        const prior=employmentByPerson.get(r.talentId)!.find(e=>e!==interval&&e.studioId===r.studioId&&e.endedWeek===r.week&&e.terms.endWeekExclusive>r.week)
        requireFact(r.toStudioId===r.studioId&&r.week===(interval.reason==='existing-player-contract'?h.originWeek:interval.terms.startWeek)&&r.reason===interval.reason&&
          r.fromStudioId===(r.reason==='renewal'&&prior?r.studioId:null),'employment start receipt differs from actual transition')
        if(r.reason==='renewal')requireFact(employmentByPerson.get(r.talentId)!.some(e=>e!==interval&&e.studioId===r.studioId&&e.endedWeek!==null&&e.endedWeek<=r.week),'renewal lacks earlier employment')
      }
    }
    if(r.kind==='studioEntered')requireFact(businessById.get(r.studioId)?.entryKey===r.entryKey&&r.week===owner.enteredWeek&&r.origin===(r.week===h.originWeek?h.origin:'scheduled'),'entry receipt differs from actual studio entry')
    if(r.kind==='filmAnnounced'){
      const row=costByProduction.get(r.productionId)
      requireFact(row&&row.studioId===r.studioId&&row.cost.conceptId===r.conceptId&&row.cost.announcedWeek===r.week,'announcement receipt has no matching paid project')
    }
    if(r.kind==='filmReleased'||r.kind==='filmSettled'){
      const f=films.get(r.productionId)
      requireFact(f?.provenance==='simulation/v1'&&f.studioId===r.studioId,'film receipt owner differs from live film')
      if(r.kind==='filmReleased'){requireFact(f.conceptId===r.conceptId&&f.result.releaseTick===r.week,'release receipt differs from actual film');standing(r.before);standing(r.after)}
      else requireFact(f.settledWeek===r.week,'settlement receipt differs from actual final payment')
    }
    const key=r.kind==='employment'?`${r.kind}:${r.contractId}:${r.toStudioId===null?'end':'start'}`:r.kind==='studioEntered'?`${r.kind}:${r.studioId}`:`${r.kind}:${r.productionId}`
    const rows=receiptGroups.get(key)??[];rows.push(r);receiptGroups.set(key,rows)
  }
  requireFact(h.nextReceipt===h.receipts.length,'receipt sequence cannot be erased or have gaps')
  for(const [index,r] of h.receipts.entries()) requireFact(r.eventId===`industry-event-${index}`,'noncanonical receipt sequence')
  for(const b of h.businesses) {
    const identity=studios.get(b.studioId)!
    const entries=grouped('studioEntered',b.studioId)
    requireFact(entries.length===1 && entries[0]!.kind==='studioEntered' && entries[0]!.entryKey===b.entryKey && entries[0]!.week===identity.enteredWeek, 'missing or repeated entry receipt')
    const entry=entries[0]!
    requireFact(entry.kind==='studioEntered' && entry.origin===(identity.enteredWeek===h.originWeek?h.origin:'scheduled'), 'entry provenance mismatch')
    if(h.origin==='fresh' && identity.row<=4) requireFact(h.films.filter(f=>f.studioId===b.studioId&&f.provenance==='authored-start/v1').length===2,'canonical starting film missing')
  }
  for(const e of h.employment) {
    const starts=grouped('employment',`${e.contractId}:start`)
    requireFact(starts.length===1 && starts[0]!.kind==='employment' && starts[0]!.talentId===e.terms.talentId && starts[0]!.week===(e.reason==='existing-player-contract'?h.originWeek:e.terms.startWeek) && starts[0]!.reason===e.reason, 'employment interval lacks exact signing or observation receipt')
    const ends=grouped('employment',`${e.contractId}:end`)
    const terminated=ends.length===1&&ends[0]!.kind==='employment'&&ends[0]!.reason==='termination'&&e.studioId===h.playerStudioId
    if(terminated)requireFact(state.ledger.some(row=>row.kind==='termination'&&row.talentId===e.terms.talentId&&row.week===e.endedWeek&&close(row.amount,-terminationCost(e.terms,e.endedWeek!))),'employment termination lacks its actual player payment')
    if(e.studioId===h.playerStudioId&&e.reason!=='existing-player-contract'&&!(h.origin==='fresh'&&e.reason==='player-contract'&&e.terms.startWeek===0))
      requireFact(state.ledger.some(row=>row.kind==='signingBonus'&&row.talentId===e.terms.talentId&&row.week===e.terms.startWeek&&close(row.amount,-e.terms.signingBonus)),'employment start lacks its actual player signing payment')
    requireFact(ends.length===(e.endedWeek===e.terms.endWeekExclusive||terminated?1:0),'employment interval lacks exact end receipt or has an extra one')
    if(e.endedWeek!==null&&e.endedWeek<e.terms.endWeekExclusive&&!terminated)requireFact(employmentByPerson.get(e.terms.talentId)!.some(next=>next!==e&&next.studioId===e.studioId&&next.reason==='renewal'&&next.terms.startWeek===e.endedWeek),'early interval end lacks actual replacement renewal')
  }
  for(const c of state.contracts.filter(c=>c.startWeek<=state.market.tick&&state.market.tick<c.endWeekExclusive))requireFact(h.activeEmploymentOrdinals.some(i=>{const e=h.employment[i]!;return e.studioId===h.playerStudioId&&sameContractTerms(e.terms,c)}),'actual player contract lacks industry employment observation')
  for(const b of h.businesses) for(const p of b.projects) {
    const announcements=p.productionId===null?[]:grouped('filmAnnounced',p.productionId)
    requireFact(p.announcedWeek===null ? announcements.length===0 : announcements.length===1 && announcements[0]!.kind==='filmAnnounced' && announcements[0]!.conceptId===p.conceptId && announcements[0]!.week===p.announcedWeek, 'announcement differs from actual commitment')
  }
  for(const f of h.films) if(f.provenance==='simulation/v1') {
    const releases=grouped('filmReleased',f.filmId)
    requireFact(releases.length===1 && releases[0]!.kind==='filmReleased' && releases[0]!.conceptId===f.conceptId && releases[0]!.week===f.result.releaseTick, 'live film lacks exact release receipt')
    const settlements=grouped('filmSettled',f.filmId)
    requireFact(f.settledWeek===null ? settlements.length===0 : settlements.length===1&&settlements[0]!.week===f.settledWeek, 'settlement receipt mismatch')
  }
  const firstChartWeek=h.originWeek+1
  const expectedChartWeek=Math.max(firstChartWeek,Math.floor(state.market.tick/13)*13)
  requireFact(state.market.tick===h.originWeek ? h.chart===null&&h.previousChart===null : h.chart?.week===expectedChartWeek,'chart differs from actual observation cadence')
  if(h.chart!==null)requireFact(h.chart.week===firstChartWeek ? h.previousChart===null : h.previousChart?.week===Math.max(firstChartWeek,h.chart.week-13),'previous chart is not the preceding observation')
  for(const snapshot of [h.chart,h.previousChart]) if(snapshot!==null) {
    exact(snapshot,['week','rows']); integer(snapshot.week); requireFact(snapshot.week<=state.market.tick,'future chart'); list(snapshot.rows)
    const ids=new Set<string>()
    const cohort=h.identities.filter(s=>s.enteredWeek!==null&&s.enteredWeek<=snapshot.week)
    requireFact(snapshot.rows.length===cohort.length,'chart cohort differs from studios entered at observation')
    for(const r of snapshot.rows) {
      exact(r,['studioId','standing','output']);standing(r.standing);integer(r.output)
      requireFact(cohort.some(s=>s.studioId===r.studioId)&&!ids.has(r.studioId),'invalid chart identity');ids.add(r.studioId)
      const output=r.studioId===h.playerStudioId ? state.studio.releasedFilms.filter(f=>f.releaseTick<snapshot.week).length :
        h.films.filter(f=>f.studioId===r.studioId&&(f.provenance==='authored-start/v1'||f.result.releaseTick<snapshot.week)).length
      requireFact(r.output===output,'chart output differs from actual released films at observation')
    }
  }
  const playerFilms=new Map(state.studio.releasedFilms.map(f=>[f.productionId,f]))
  const playerCareers=new Map(state.careerEvents.map(e=>[e.eventId,e]))
  for(const row of state.studioHistory.rows) {
    for(const subject of row.subjects) {
      if(subject.kind==='film')requireFact(playerFilms.has(subject.productionId),'history names an unknown player film')
      if(subject.kind==='person')requireFact(talent.has(subject.talentId),'history names an unknown person')
    }
    if(row.kind==='filmReleased') {
      const film=playerFilms.get(row.productionId)
      requireFact(film&&film.conceptId===row.conceptId&&film.releaseTick===row.week,'history release differs from its canonical film')
    }
    if(row.kind==='theatricalRunCompleted')requireFact(playerFilms.has(row.productionId),'history settlement names an unknown film')
    if(row.kind==='standingChanged'&&row.source.kind==='releaseResult')requireFact(playerFilms.has(row.source.productionId),'history Standing names an unknown release')
    if(row.kind==='careerMilestone') {
      const event=playerCareers.get(row.careerEventId)
      requireFact(event&&event.talentId===row.talentId&&event.filmId===row.filmId&&event.releaseWeek===row.week,'history career milestone differs from its canonical career event')
    }
  }
}
