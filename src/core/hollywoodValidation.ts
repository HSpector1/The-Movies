import { flattenParticipants } from './starPower.js'
import { HOLLYWOOD_STARTING_MANIFEST, RIVAL_CREDIT_ROLES, RIVAL_TEAM_ROLES } from './hollywoodStartingData.js'
import { persistedConceptIds, persistedProductionIds } from './productionIdentity.js'
import { weeklySalary } from './employment.js'
import type { GameState } from './types.js'
import { CAMPAIGN_CALENDAR_POLICY, campaignDate, historicalDate, RIVAL_ARRIVAL_WEEKS } from './calendar.js'
import { RIVAL_MONEY_KINDS, rivalCapacityOpex } from './hollywood.js'
import { GENRE_ORDER, TUNING } from './tuning.js'
import { assertStudioOperationsInvariants } from './operations.js'
import { assertScriptDevelopmentInvariants } from './scriptDevelopment.js'
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
  const studios = new Map(h.identities.map(s => [s.studioId,s]))
  requireFact(studios.size === 10 && h.identities.length === 10,'exactly player plus nine reserved studios')
  const names = new Set<string>()
  for (const [index,s] of h.identities.entries()) {
    exact(s,['studioId','role','row','name','mark','color','founding','eligibleWeek','enteredWeek','recordedFromWeek'])
    text(s.studioId); text(s.name); text(s.mark); text(s.color)
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
      if (h.origin === 'migration' && index > 0) requireFact(s.enteredWeek >= h.originWeek && s.founding?.kind !== 'beforeCampaign','fabricated migration past')
    }
  }
  requireFact(h.identities[0]!.studioId === h.playerStudioId,'player identity mismatch')
  const talent = new Map(state.talent.map(t => [t.id,t]))
  const concepts = persistedConceptIds({...state,hollywood:null} as GameState)
  for (const c of h.concepts) { shared.concept(c); requireFact(!concepts.has(c.id),'concept identity collision'); concepts.add(c.id) }
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
        talent.get(c.talentId)?.role === RIVAL_TEAM_ROLES[i]),'authored credit differs from canonical starting manifest')
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
  const intervals = new Map<string,[number,number][]>(); const employed = new Set(state.contracts.filter(c => c.startWeek <= state.market.tick && state.market.tick < c.endWeekExclusive).map(c => c.talentId))
  for (const e of h.employment) {
    exact(e,['contractId','studioId','terms','endedWeek','reason']); text(e.contractId)
    requireFact(!contractIds.has(e.contractId),'contract identity collision'); contractIds.add(e.contractId)
    const studio = studios.get(e.studioId); requireFact(studio?.enteredWeek !== null && studio,'contract owner inactive/unknown')
    shared.contract(e.terms)
    requireFact(talent.has(e.terms.talentId) && e.terms.startWeek >= studio.enteredWeek! && e.terms.startWeek <= state.market.tick,'unknown person or invalid employment chronology')
    requireFact(['entry','renewal','replacement','player-contract'].includes(e.reason),'unknown employment cause')
    if (e.endedWeek !== null) { integer(e.endedWeek); requireFact(e.endedWeek >= e.terms.startWeek && e.endedWeek <= e.terms.endWeekExclusive && e.endedWeek <= state.market.tick,'invalid contract end') }
    const end = e.endedWeek ?? e.terms.endWeekExclusive
    const prior = intervals.get(e.terms.talentId) ?? []
    requireFact(prior.every(([a,b]) => end <= a || e.terms.startWeek >= b),'overlapping industry employers')
    prior.push([e.terms.startWeek,end]); intervals.set(e.terms.talentId,prior)
    if (e.studioId !== h.playerStudioId && e.terms.startWeek <= state.market.tick && state.market.tick < end) {
      requireFact(!employed.has(e.terms.talentId),'double employer'); employed.add(e.terms.talentId)
      requireFact(!state.founding?.applicantIds.includes(e.terms.talentId),'rival stole founding applicant')
    }
  }
  requireFact(new Set(h.activeEmploymentOrdinals).size===h.activeEmploymentOrdinals.length,'duplicate employment index')
  for(const [i,e] of h.employment.entries()) requireFact(h.activeEmploymentOrdinals.includes(i)===(e.endedWeek===null&&e.terms.endWeekExclusive>state.market.tick), 'active employment index differs from contract interval')
  const businesses = new Set<string>(); const productionIds = new Set([...filmIds,...state.studio.activeProductions.map(p => p.id)])
  for (const b of h.businesses) {
    exact(b,['studioId','entryKey','account','standing','operations','development','productions','activeScriptOrdinals','activeRunFilmOrdinals','releaseAuthority','runs','projects','nextDecisionWeek','policy'])
    requireFact(!businesses.has(b.studioId) && studios.get(b.studioId)?.role === 'rival' && studios.get(b.studioId)!.enteredWeek !== null,'duplicate/unknown business'); businesses.add(b.studioId)
    requireFact(b.entryKey === `${b.studioId}:entry`,'entry key mismatch'); integer(b.nextDecisionWeek); standing(b.standing)
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
    requireFact(close(movements.signing!, -employed.reduce((sum,e)=>sum+e.terms.signingBonus,0)),'signing bonuses do not reconcile')
    const personWeeks = employed.map(e=>Math.max(0,Math.min(state.market.tick,e.endedWeek ?? e.terms.endWeekExclusive)-e.terms.startWeek))
    requireFact(close(movements.payroll!, -employed.reduce((sum,e,i)=>sum+personWeeks[i]!*weeklySalary(e.terms.annualSalary),0)), 'payroll does not reconcile with employment intervals')
    const elapsed = state.market.tick-studios.get(b.studioId)!.enteredWeek!
    requireFact(close(movements.overhead!, -(elapsed*TUNING.OVERHEAD_BASE+personWeeks.reduce((a,b)=>a+b,0)*TUNING.OVERHEAD_PER_EMPLOYEE)), 'overhead does not reconcile')
    requireFact(close(movements.facilityOpex!, -elapsed*rivalCapacityOpex(b)), 'facility operating costs do not reconcile')
    for(const kind of ['development','production','marketing'] as const) requireFact(close(movements[kind]!, -b.projects.reduce((sum,p)=>sum+p[kind],0)), `${kind} commitments do not reconcile`)
    const ownedFilms = h.films.filter(f=>f.studioId===b.studioId && f.provenance==='simulation/v1')
    requireFact(close(movements.studioRevenue!, ownedFilms.reduce((sum,f)=>sum+(f.provenance==='simulation/v1'?f.studioRevenueReceived:0),0)), 'studio revenue does not reconcile')
    list(b.productions); list(b.runs); list(b.projects)
    for (const p of b.productions) { shared.production(p,concepts); requireFact(!productionIds.has(p.id),'production identity collision'); productionIds.add(p.id) }
    list(b.activeScriptOrdinals);list(b.activeRunFilmOrdinals)
    requireFact(b.activeScriptOrdinals.length<=2 && new Set(b.activeScriptOrdinals).size===b.activeScriptOrdinals.length, 'bounded unique active screenplay index')
    for(const [ordinal,p] of b.development.projects.entries()) requireFact(b.activeScriptOrdinals.includes(ordinal)===(p.status!=='produced'), 'active screenplay index differs from lifecycle')
    for(const [i,run] of b.runs.entries()) requireFact(h.films[b.activeRunFilmOrdinals[i]!]?.filmId===run.productionId, 'active run index differs from film identity')
    requireFact(b.activeRunFilmOrdinals.length===b.runs.length,'active run index size')
    shared.operations(b.operations,b.productions); shared.development(b.development)
    assertStudioOperationsInvariants(b.operations,b.productions,{facilityPolicy:'configured'})
    const ownedConcepts = h.concepts.filter(c => b.development.projects.some(p => p.conceptId === c.id))
    assertScriptDevelopmentInvariants(b.development,{currentWeek:state.market.tick,concepts:ownedConcepts,talent:state.talent,
      contracts:h.employment.filter(e=>e.studioId===b.studioId && e.endedWeek===null).map(e=>e.terms),
      operations:b.operations,activeProductions:b.productions,
      releasedFilms:h.films.flatMap(f=>f.studioId===b.studioId && f.provenance==='simulation/v1'?[f.result]:[])})
    exact(b.releaseAuthority,['commitments']); list(b.releaseAuthority.commitments)
    for (const c of b.releaseAuthority.commitments) {
      exact(c,['productionId','commitmentId','committedAtWeek']); integer(c.committedAtWeek)
      requireFact(c.commitmentId === `release-commitment-${c.productionId}` && b.productions.some(p=>p.id===c.productionId && p.remainingTicks===1),'invalid release commitment')
    }
    for (const p of b.projects) {
      exact(p,['scriptProjectId','conceptId','conceptOrdinal','productionId','development','production','marketing','announcedWeek'])
      requireFact(b.development.projects.some(s=>s.id===p.scriptProjectId && s.conceptId===p.conceptId),'unknown project cost owner')
      integer(p.conceptOrdinal);requireFact(h.concepts[p.conceptOrdinal]?.id===p.conceptId,'project concept index mismatch')
      number(p.development,0); number(p.production,0); number(p.marketing,0)
      if(p.announcedWeek!==null) {integer(p.announcedWeek);requireFact(p.announcedWeek<=state.market.tick,'future announcement')}
    }
    const ownedIds = new Set(ownedFilms.map(f=>f.filmId))
    const costs = new Set<string>()
    for(const p of b.projects) {
      requireFact(!costs.has(p.scriptProjectId),'duplicate project cost owner');costs.add(p.scriptProjectId)
      requireFact(p.productionId === null || b.productions.some(f=>f.id===p.productionId&&f.conceptId===p.conceptId) ||
        ownedFilms.some(f=>f.filmId===p.productionId&&f.conceptId===p.conceptId), 'costed production missing actual owner')
    }
    requireFact(costs.size === b.development.projects.length, 'development project missing cost authority')
    const runs = new Set<string>()
    for (const run of b.runs) {
      shared.run(run,ownedIds,concepts); requireFact(!runs.has(run.productionId),'duplicate run');runs.add(run.productionId)
    }
    for (const f of ownedFilms) if(f.provenance==='simulation/v1') {
      const cost=b.projects.find(p=>p.scriptProjectId===f.scriptProjectId)
      const script=b.development.projects.find(p=>p.id===f.scriptProjectId)
      requireFact(script?.status==='produced' && script.productionId===f.filmId && cost?.productionId===f.filmId &&
        cost.conceptId===f.conceptId && close(f.directCommitment,cost.development+cost.production+cost.marketing), 'live film lacks its costed completed project')
      requireFact(f.releaseCommitmentId===`release-commitment-${f.filmId}`, 'live film lacks canonical release commitment')
      requireFact((f.settledWeek===null) === runs.has(f.filmId),'live/settled film run mismatch')
      requireFact(f.result.participants && f.credits.length===flattenParticipants(f.result.participants).length && f.credits.every(c=>flattenParticipants(f.result.participants!).some(p=>p.talentId===c.talentId&&p.role===c.role)), 'live credit differs from release result')
    }
  }
  requireFact(businesses.size === h.identities.filter(s=>s.role==='rival'&&s.enteredWeek!==null).length,'entry missing business')
  const events = new Set<string>()
  for (const e of h.careerEvents) {
    shared.career(e,liveIds); requireFact(!events.has(e.eventId),'duplicate career event'); events.add(e.eventId)
    const f=films.get(e.filmId); requireFact(f?.provenance==='simulation/v1' && f.credits.some(c=>c.talentId===e.talentId&&c.role===e.role),'career credit does not match live film')
  }
  const receiptIds=new Set<string>(); let priorWeek=h.originWeek
  for (const r of h.receipts) {
    const base=['eventId','week','studioId']
    const extra = {studioEntered:['entryKey','origin'],employment:['talentId','fromStudioId','toStudioId','contractId','reason'],filmAnnounced:['productionId','conceptId'],filmReleased:['productionId','conceptId','before','after'],filmSettled:['productionId']}[r.kind]
    requireFact(extra,'unknown receipt kind'); exact(r,[...base,'kind',...extra])
    integer(r.week); requireFact(r.week>=priorWeek&&r.week<=state.market.tick,'receipt chronology'); priorWeek=r.week
    requireFact(studios.has(r.studioId),'unknown receipt studio'); text(r.eventId)
    requireFact(!receiptIds.has(r.eventId),'duplicate receipt'); receiptIds.add(r.eventId)
    requireFact(/^industry-event-\d+$/.test(r.eventId) && Number(r.eventId.slice(15)) < h.nextReceipt,'receipt high water mark')
    if(r.kind==='employment') requireFact(talent.has(r.talentId)&&contractIds.has(r.contractId),'unknown employment receipt subject')
    if(r.kind==='filmAnnounced'||r.kind==='filmReleased'||r.kind==='filmSettled') requireFact(productionIds.has(r.productionId),'unknown film receipt subject')
    if(r.kind==='filmReleased') {standing(r.before);standing(r.after)}
  }
  requireFact(h.nextReceipt===h.receipts.length,'receipt sequence cannot be erased or have gaps')
  for(const [index,r] of h.receipts.entries()) requireFact(r.eventId===`industry-event-${index}`,'noncanonical receipt sequence')
  for(const b of h.businesses) {
    const identity=studios.get(b.studioId)!
    const entries=h.receipts.filter(r=>r.kind==='studioEntered'&&r.studioId===b.studioId)
    requireFact(entries.length===1 && entries[0]!.kind==='studioEntered' && entries[0]!.entryKey===b.entryKey && entries[0]!.week===identity.enteredWeek, 'missing or repeated entry receipt')
    const entry=entries[0]!
    requireFact(entry.kind==='studioEntered' && entry.origin===(identity.enteredWeek===h.originWeek?h.origin:'scheduled'), 'entry provenance mismatch')
    if(h.origin==='fresh' && identity.row<=4) requireFact(h.films.filter(f=>f.studioId===b.studioId&&f.provenance==='authored-start/v1').length===2,'canonical starting film missing')
  }
  for(const e of h.employment) {
    const starts=h.receipts.filter(r=>r.kind==='employment'&&r.contractId===e.contractId&&r.toStudioId===e.studioId)
    requireFact(starts.length===1 && starts[0]!.kind==='employment' && starts[0]!.talentId===e.terms.talentId && starts[0]!.week===e.terms.startWeek && starts[0]!.reason===e.reason, 'employment interval lacks exact signing receipt')
  }
  for(const b of h.businesses) for(const p of b.projects) {
    const announcements=h.receipts.filter(r=>r.kind==='filmAnnounced'&&r.studioId===b.studioId&&r.productionId===p.productionId)
    requireFact(p.announcedWeek===null ? announcements.length===0 : announcements.length===1 && announcements[0]!.week===p.announcedWeek, 'announcement differs from actual commitment')
  }
  for(const f of h.films) if(f.provenance==='simulation/v1') {
    const releases=h.receipts.filter(r=>r.kind==='filmReleased'&&r.studioId===f.studioId&&r.productionId===f.filmId)
    requireFact(releases.length===1 && releases[0]!.kind==='filmReleased' && releases[0]!.conceptId===f.conceptId && releases[0]!.week===f.result.releaseTick, 'live film lacks exact release receipt')
    const settlements=h.receipts.filter(r=>r.kind==='filmSettled'&&r.studioId===f.studioId&&r.productionId===f.filmId)
    requireFact(f.settledWeek===null ? settlements.length===0 : settlements.length===1&&settlements[0]!.week===f.settledWeek, 'settlement receipt mismatch')
  }
  for(const snapshot of [h.chart,h.previousChart]) if(snapshot!==null) {
    exact(snapshot,['week','rows']); integer(snapshot.week); requireFact(snapshot.week<=state.market.tick,'future chart'); list(snapshot.rows)
    const ids=new Set<string>()
    for(const r of snapshot.rows) {exact(r,['studioId','standing','output']);standing(r.standing);integer(r.output);requireFact(studios.has(r.studioId)&&!ids.has(r.studioId),'invalid chart identity');ids.add(r.studioId)}
  }
}
