import { productionCompanyTalentIds } from './productionPeople.js'
import { recordPlayerEmployment } from './industryEmployment.js'
import { CAMPAIGN_CALENDAR_POLICY, historicalDate, RIVAL_ARRIVAL_WEEKS } from './calendar.js'
import { HOLLYWOOD_STARTING_MANIFEST, RIVAL_CREDIT_ROLES, RIVAL_TEAM_ROLES, startingStanding } from './hollywoodStartingData.js'
import { busyTalentIds, offerForTalent, weeklySalary } from './employment.js'
import { initialReleaseAuthority } from './releaseAuthority.js'
import { initialManagedScriptDevelopment, scriptProjectWriterIds } from './scriptDevelopment.js'
import { stream } from './rng.js'
import { generateIndustryTalent } from './worldgen.js'
import { GENRE_ORDER, ROLE_TO_DISCIPLINE, TUNING } from './tuning.js'
import type { GameState, GameStateV18, Genre, Talent } from './types.js'
import type { HollywoodState, RivalAccount, RivalBusiness, RivalFinancePeriod,
  RivalMoneyKind, StudioIdentity } from './hollywoodTypes.js'

export const RIVAL_MONEY_KINDS: readonly RivalMoneyKind[] = ['capacity','signing','payroll','overhead',
  'facilityOpex','development','production','marketing','studioRevenue']

export function uniqueIdentity(base: string, taken: Set<string>): string {
  let id = base
  for (let suffix = 1; taken.has(id); suffix++) id = `${base}-${suffix}`
  taken.add(id)
  return id
}

export function newFinancePeriod(week: number, opening: number): RivalFinancePeriod {
  return { fromWeek: week, throughWeek: week, opening, closing: opening,
    movements: Object.fromEntries(RIVAL_MONEY_KINDS.map(kind => [kind,0])) as RivalFinancePeriod['movements'] }
}

/** Local working account only. Every committed movement reconciles its period. */
export function moveRivalMoney(account: RivalAccount, kind: RivalMoneyKind, amount: number, week: number): void {
  if (!Number.isFinite(amount) || !Number.isFinite(account.cash + amount)) throw new Error('Nonfinite rival money')
  let period = account.periods[account.periods.length-1]!
  if (Math.floor(week/52) !== Math.floor(period.fromWeek/52)) {
    period = newFinancePeriod(week,account.cash)
    account.periods.push(period)
  }
  account.cash += amount
  period.movements[kind] += amount
  period.closing = account.cash
  period.throughWeek = week
}

const employmentByPerson=new WeakMap<HollywoodState['employment'],Map<string,HollywoodState['employment']>>()
export function rivalEmployment(state: Pick<GameState, 'hollywood'>, talentId: string, week: number) {
  const rows=state.hollywood?.employment
  if(!rows)return null
  let index=employmentByPerson.get(rows)
  if(!index){index=new Map();for(const row of rows){const own=index.get(row.terms.talentId)??[];own.push(row);index.set(row.terms.talentId,own)}employmentByPerson.set(rows,index)}
  return index.get(talentId)?.find(row =>
    row.studioId !== state.hollywood?.playerStudioId &&
    row.terms.startWeek <= week && week < row.terms.endWeekExclusive &&
    (row.endedWeek === null || week < row.endedWeek)) ?? null
}

export function rivalBusiness(state: Pick<GameState, 'hollywood'>, studioId: string): RivalBusiness | null {
  return state.hollywood?.businesses.find(row => row.studioId === studioId) ?? null
}

export function studioEmployerId(state: GameState, talentId: string, week = state.market.tick): string | null {
  if (state.contracts.some(c => c.talentId === talentId && c.startWeek <= week && week < c.endWeekExclusive)) {
    return state.hollywood?.playerStudioId ?? null
  }
  return rivalEmployment(state,talentId,week)?.studioId ?? null
}

export function industryBusyTalentIds(hollywood: HollywoodState | null | undefined): Set<string> {
  const ids = new Set<string>()
  for (const business of hollywood?.businesses ?? []) {
    for (const ordinal of business.activeScriptOrdinals) {
      const project=business.development.projects[ordinal]!
      if (project.status === 'drafting' || project.status === 'rewriting') {
        for (const id of scriptProjectWriterIds(project)) ids.add(id)
      }
    }
    for (const id of productionCompanyTalentIds(business.productions)) ids.add(id)
  }
  return ids
}

export function rivalWeeklyOperatingCost(business: RivalBusiness, hollywood: HollywoodState, week: number): number {
  const contracts = hollywood.activeEmploymentOrdinals.map(i=>hollywood.employment[i]!).filter(row => row.studioId === business.studioId && row.endedWeek === null &&
    row.terms.startWeek <= week && week < row.terms.endWeekExclusive)
  return contracts.reduce((sum,row) => sum + weeklySalary(row.terms.annualSalary),0) +
    TUNING.OVERHEAD_BASE + TUNING.OVERHEAD_PER_EMPLOYEE * contracts.length + rivalCapacityOpex(business)
}

export function rivalCapacityOpex(business: RivalBusiness): number {
  return business.operations.facilities.reduce((sum,f) => sum + ({
    'development-casting': TUNING.BASELINE_DEVELOPMENT_CASTING_WEEKLY_OPERATING_COST,
    soundstage: TUNING.STAGE_STANDARD_WEEKLY_OPERATING_COST,
    post: TUNING.POST_BUILDING_WEEKLY_OPERATING_COST,
    'set-scenery': TUNING.SCENERY_SHOP_WEEKLY_OPERATING_COST,
  }[f.capability]),0)
}

/** New root only; null is the historical non-player harness, never a native campaign. */
export function rivalStartingFacilities(studioId:string):RivalBusiness['operations']['facilities'] {
  return [
    {id:`${studioId}:development`,name:'Development & Casting',capability:'development-casting',capacity:2},
    {id:`${studioId}:stage`,name:'Production Stage',capability:'soundstage',capacity:1},
    {id:`${studioId}:scenery`,name:'Scenery Shop',capability:'set-scenery',capacity:2},
    {id:`${studioId}:post`,name:'Post Building',capability:'post',capacity:2},
  ]
}

export function hollywoodWorldKey(seed: GameState['seed']): string {
  return Math.floor(stream(seed,'hollywood-v1','identity').next()*0x100000000).toString(16).padStart(8,'0')
}

export function initializeHollywood(state: GameStateV18 & { hollywood?: HollywoodState | null }, origin: 'fresh' | 'migration'): GameState {
  if (state.hollywood) return state as GameState
  const key = hollywoodWorldKey(state.seed)
  const taken = new Set(state.talent.map(t => t.id))
  for (const c of state.concepts) taken.add(c.id)
  const playerStudioId = uniqueIdentity(`studio-${key}-player`,taken)
  const identities: StudioIdentity[] = [{ studioId: playerStudioId, role: 'player', row: 0,
    name: 'Your Studio', mark: 'YOU', color: '#ECD9AA', founding: origin === 'fresh' ? {kind:'campaign',week:0} : null,
    eligibleWeek: 0, enteredWeek: state.market.tick, recordedFromWeek: state.studioHistory.recordingStartedWeek }]
  HOLLYWOOD_STARTING_MANIFEST.studios.forEach((template,index) => identities.push({
    studioId: uniqueIdentity(`studio-${key}-r${String(index+1).padStart(2,'0')}`,taken),
    role:'rival', row:index+1, name:template.name, mark:template.mark, color:template.color,
    founding: origin === 'fresh' && template.founded ? historicalDate(template.founded) : null,
    eligibleWeek:RIVAL_ARRIVAL_WEEKS[index]!, enteredWeek:null, recordedFromWeek:null,
  }))
  const hollywood: HollywoodState = { version:1, calendarPolicy:CAMPAIGN_CALENDAR_POLICY,
    startingManifest:'living-hollywood-start/v1', origin, originWeek:state.market.tick, worldId:`world-${key}`,
    playerStudioId, identities, businesses:[], employment:[], activeEmploymentOrdinals:[], concepts:[], films:[], careerEvents:[],
    receipts:[], nextReceipt:0, chart:null, previousChart:null }
  let next: GameState = {...state, hollywood}
  // A due migration entry is at this state's own week, never its scheduled past.
  for (const identity of identities.slice(1)) if (identity.eligibleWeek <= state.market.tick) {
    next = enterRival(next,identity.studioId,origin)
  }
  return recordPlayerEmployment(next,origin==='migration')
}

/** Atomic pure entry: no caller-owned object is modified, even if validation throws. */
export function enterRival(state: GameState, studioId: string, origin: 'fresh' | 'migration' | 'scheduled'): GameState {
  const source = state.hollywood
  if (!source) throw new Error('Industry identity registry is not initialized')
  const original = source.identities.find(s => s.studioId === studioId && s.role === 'rival')
  if (!original || original.eligibleWeek > state.market.tick) throw new Error('Rival is not due for entry')
  if (original.enteredWeek !== null) return state
  const h = {...source, identities:source.identities.map(s => ({...s})), businesses:[...source.businesses],
    employment:[...source.employment], activeEmploymentOrdinals:[...source.activeEmploymentOrdinals], films:[...source.films], receipts:[...source.receipts]}
  const identity = h.identities.find(s => s.studioId === studioId)!
  const template = HOLLYWOOD_STARTING_MANIFEST.studios[identity.row-1]!
  const week = state.market.tick
  const authored = origin === 'fresh' && identity.row <= 4
  const account: RivalAccount = {openingBalance:template.capital, openingBasis:'before-capacity-and-signing',
    cash:template.capital, periods:[newFinancePeriod(week,template.capital)]}
  const business: RivalBusiness = {studioId, entryKey:`${studioId}:entry`, account,
    standing:startingStanding(template,authored), operations:{mode:'managed',workflows:[],facilities:rivalStartingFacilities(studioId)}, development:initialManagedScriptDevelopment(), productions:[], activeScriptOrdinals:[], activeRunFilmOrdinals:[], releaseAuthority:initialReleaseAuthority(),
    runs:[], projects:[], nextDecisionWeek:week+1,
    policy:{version:1,affinities:Object.fromEntries(GENRE_ORDER.map(g => [g,template.anchors.includes(g)?5:1])) as Record<Genre,number>,
      negativeScale:template.negativeScale,marketingRatio:template.marketingRatio,reserveWeeks:template.reserveWeeks}}
  const capex = TUNING.BASELINE_DEVELOPMENT_CASTING_CAPEX + TUNING.STAGE_STANDARD_CAPEX +
    TUNING.SCENERY_SHOP_CAPEX + TUNING.POST_BUILDING_CAPEX
  moveRivalMoney(account,'capacity',-capex,week)
  let talent = [...state.talent]
  const reserved = busyTalentIds(state)
  for (const id of state.founding?.applicantIds ?? []) reserved.add(id)
  for (const c of state.contracts) reserved.add(c.talentId)
  for (const ordinal of h.activeEmploymentOrdinals) { const c=h.employment[ordinal]!; if (c.endedWeek === null && c.terms.endWeekExclusive > week) reserved.add(c.terms.talentId) }
  const peopleTaken = new Set(talent.map(t => t.id))
  const credits = RIVAL_TEAM_ROLES.map((role,index) => {
    let person: Talent | undefined = authored ? undefined : talent.find(t => t.role === role && !reserved.has(t.id))
    if (!person) {
      const id = uniqueIdentity(`person-${studioId}-${index}`,peopleTaken)
      person = generateIndustryTalent(state.seed,id,role,authored ? template.names![index] : undefined)
      if (authored) {
        const discipline = ROLE_TO_DISCIPLINE[role]
        person = {...person,age:Math.max(28,person.age), workHistory:{...person.workHistory,[discipline]:template.films!.length}}
      }
      talent.push(person)
    }
    reserved.add(person.id)
    const terms = offerForTalent(state.seed,person,208,week)
    const contractId = `${studioId}:contract:${person.id}:${week}`
    moveRivalMoney(account,'signing',-terms.signingBonus,week)
    h.activeEmploymentOrdinals.push(h.employment.length)
    h.employment.push({contractId,studioId,terms,endedWeek:null,reason:'entry'})
    h.receipts.push({eventId:`industry-event-${h.nextReceipt++}`,week,studioId,kind:'employment',talentId:person.id,
      fromStudioId:null,toStudioId:studioId,contractId,reason:'entry'})
    return {talentId:person.id,name:person.name,role:RIVAL_CREDIT_ROLES[index]!}
  })
  if (account.cash < 0) throw new Error('Rival entry endowment cannot pay its costed resources')
  identity.enteredWeek = week
  identity.recordedFromWeek = week
  // Scheduled companies genuinely begin here. Migration establishes entry only.
  if (origin === 'scheduled') identity.founding = {kind:'campaign',week}
  h.businesses.push(business)
  h.receipts.push({eventId:`industry-event-${h.nextReceipt++}`,week,studioId,kind:'studioEntered',entryKey:business.entryKey,origin})
  if (authored) template.films!.forEach(([title,year,genre,criticScore,audienceScore,openingGross,totalGross],index) => {
    h.films.push({filmId:`${studioId}:historical-film:${index}`,studioId,conceptId:`${studioId}:historical-concept:${index}`,
      title,genre,credits:credits.map(c => ({...c})),provenance:'authored-start/v1',released:historicalDate(year),
      criticScore,audienceScore,openingGross,totalGross,settled:true})
  })
  return {...state,talent,hollywood:h}
}
