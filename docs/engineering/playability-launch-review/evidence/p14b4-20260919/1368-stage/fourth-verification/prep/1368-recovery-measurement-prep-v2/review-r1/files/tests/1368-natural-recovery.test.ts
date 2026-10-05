import { it, vi } from 'vitest'
import { createHash } from 'node:crypto'
import { appendFileSync, existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { performance } from 'node:perf_hooks'
import { tick } from '../src/core/tick.js'
import { p13aGeneratedStudio } from '../src/harness/p13a/fixtures.js'
import { makeSave, stableStringify } from '../src/core/save.js'
import type { GameState } from '../src/core/types.js'
import type { RivalBusiness } from '../src/core/hollywoodTypes.js'
import * as policy from '../src/core/hollywoodPolicy.js'
import * as standingLaw from '../src/core/standing.js'
import { computeForecast, forecastCenters } from '../src/core/forecast.js'
import { resolveShape } from '../src/core/shape.js'
import { marketingCapacityForInputs, marketingMenuFromCapacity } from '../src/core/marketingMenu.js'
import { rivalCapacityOpex, rivalWeeklyOperatingCost } from '../src/core/hollywood.js'
import { weeklySalary, weeklyPayroll, economyEngaged } from '../src/core/employment.js'
import { weeklyFacilityOperatingCost, weeklyOverhead } from '../src/core/economyView.js'
import { stepCondition } from '../src/core/corporateCondition.js'
import type { Condition, ConditionTransition } from '../src/core/corporateCondition.js'
import { contractLoan, loanEligible, loanInstallmentDue, loanMaxPrincipal } from '../src/core/studioLoan.js'
import type { StudioLoan } from '../src/core/studioLoan.js'
import { TUNING } from '../src/core/tuning.js'
import { setMeasurementSink } from './1368-measurement-observer.js'

const SEEDS = ['p13a-core-causal-01', 'seed-b', 'p13b-s8-bridge-probe-01', 'p13-public-commercial-adoption', 'p15a1-w2-market-01'] as const
const seed = process.env.M1368_SEED ?? ''
const arm = process.env.M1368_ARM ?? ''
const mode = process.env.M1368_MODE ?? ''
const destination = process.env.M1368_OUTPUT ?? ''
const manifestPath = process.env.M1368_ARM_MANIFEST ?? ''
const manifestPin = process.env.M1368_ARM_MANIFEST_SHA256 ?? ''
const sha = (v: string | Buffer): string => createHash('sha256').update(v).digest('hex')
const hash = (v: unknown): string => sha(stableStringify(v))
const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v)) as T
const requireFact = (condition: unknown, label: string): void => { if (!condition) throw new Error(label) }
const near = (a: number, b: number): boolean => Math.abs(a - b) <= .01
const optionalSince = (b: RivalBusiness): number | null => (b as unknown as { costCutting?: { since: number | null } }).costCutting?.since ?? null
const sums = (b: RivalBusiness): Record<string, number> => {
  const out: Record<string, number> = {}
  for (const period of b.account.periods) for (const [kind, amount] of Object.entries(period.movements)) out[kind] = (out[kind] ?? 0) + amount
  return out
}
function comparableAccount(b: RivalBusiness): string | null {
  const account=clone(b.account)
  for(const period of account.periods){const m=period.movements as unknown as Record<string,number>;if((m.facilityDemolitionRefund??0)!==0)return null;delete m.facilityDemolitionRefund}
  return hash(account)
}
/** Only EMPTY new authority is projected. Active cutting/disposal has no old-era comparable hash. */
function emptyRecoveryProjection(state: GameState): string | null {
  const copy = clone(state)
  for (const b of copy.hollywood?.businesses ?? []) {
    if (optionalSince(b) !== null) return null
    delete (b as unknown as { costCutting?: unknown }).costCutting
    for (const p of b.account.periods) {
      const movements = p.movements as unknown as Record<string, number>
      if ((movements.facilityDemolitionRefund ?? 0) !== 0) return null
      delete movements.facilityDemolitionRefund
    }
  }
  if (copy.hollywood?.receipts.some(r => (r as { kind: string }).kind === 'facilityDisposed')) return null
  return hash(copy)
}
type Track = { condition: Condition | null; transitions: ConditionTransition[]; loan: StudioLoan | null; loans: StudioLoan[]; delta: number; installmentsPaid: number }
const track = (): Track => ({ condition: null, transitions: [], loan: null, loans: [], delta: 0, installmentsPaid: 0 })
function conditionStep(t: Track, week: number, cash: number, cost: number, installment: number): void {
  if (t.condition?.stage === 'closed') return
  const result = stepCondition(t.condition, { week, cash, weeklyFixedCost: cost, loanInstallment: installment })
  t.condition = result.next
  if (result.transition) t.transitions.push(result.transition)
}
// All loops and forecasts are observer-only. No package, quote, promise or history enters the game.
function packageFacts(input: Parameters<typeof policy.chooseIndustryPackage>[0], posture: Parameters<typeof policy.chooseIndustryPackage>[1], options: Parameters<typeof policy.chooseIndustryPackage>[2]) {
  const planning = policy.perceivedPlanningInputs(input)
  const actors = [planning.cast.lead, planning.cast.antagonist, planning.cast.support]
  const billings = [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]] as const
  let enumerated = 0, affordable = 0, unaffordable = 0, viable = 0, unaffordableViable = 0, negativeOperatingMargin = 0
  let minimumPackageCost: number | null = null, minimumViablePackageCost: number | null = null
  const margins: number[] = []
  for (const billing of billings) {
    const inp = { ...planning, shapeEffects: resolveShape(planning.shape), cast: { lead: actors[billing[0]]!, antagonist: actors[billing[1]]!, support: actors[billing[2]]! } }
    const required = inp.concept.baseNegativeCost * inp.shapeEffects.budgetDemandMultiplier * inp.era.costScale
    for (const scale of TUNING.HOLLYWOOD_NEGATIVE_CHOICES) {
      const negative = Math.round(required * scale * posture.negativeScale)
      const base = { ...inp, budget: { negative, marketing: 0 } }
      for (const marketing of marketingMenuFromCapacity(marketingCapacityForInputs(base, true))) {
        enumerated++
        const cost = negative + marketing
        minimumPackageCost = minimumPackageCost === null ? cost : Math.min(cost, minimumPackageCost)
        const exceeds = cost > options.cashAvailable
        if (exceeds) unaffordable++; else affordable++
        const forecast = computeForecast({ ...base, budget: { negative, marketing } }, { seed: options.seed, productionId: options.key, directorId: inp.director.id, releasedFilms: [], concepts: [inp.concept] }, true, true)
        const contribution = forecast.expectedTotal * TUNING.STUDIO_RENTAL_BLENDED - cost
        const hold = -options.weeklyCost * (TUNING.PRODUCTION_TICKS + TUNING.THEATRICAL_WEEKS)
        const margin = contribution + hold
        margins.push(margin)
        if (margin < 0) negativeOperatingMargin++
        const score = margin - Math.abs(marketing / Math.max(negative, 1) - posture.marketingRatio) * TUNING.HOLLYWOOD_POLICY_PREFERENCE_COST
        if (score > hold) {
          minimumViablePackageCost = minimumViablePackageCost === null ? cost : Math.min(cost, minimumViablePackageCost)
          if (exceeds) unaffordableViable++; else viable++
        }
      }
    }
  }
  requireFact(affordable + unaffordable === enumerated && viable <= affordable && unaffordableViable <= unaffordable, 'package count conservation')
  return { enumerated, affordable, unaffordable, viable, unaffordableViable, negativeOperatingMargin, minimumPackageCost, minimumViablePackageCost, margins }
}

it('1368 fixed natural recovery measurement', () => {
  requireFact(SEEDS.some(s => s === seed) && ['C0','A','AB','ABC'].includes(arm) && ['clean','observed','repeat'].includes(mode), 'fixed seed/arm/mode required')
  requireFact(destination && manifestPath && /^[a-f0-9]{64}$/.test(manifestPin), 'explicit output and pinned manifest required')
  const manifestBytes = readFileSync(manifestPath)
  requireFact(sha(manifestBytes) === manifestPin, 'arm manifest changed')
  const manifest = JSON.parse(manifestBytes.toString()) as { arm: string; saveVersion: number; pressure: string; sourceIdentity: unknown }
  requireFact(manifest.arm === arm && [45,46].includes(manifest.saveVersion) && manifest.pressure === 'as-authored', 'wrong arm manifest')
  const out = resolve(destination)
  for (let p = dirname(out); ; p = dirname(p)) { if (existsSync(p)) requireFact(!lstatSync(p).isSymbolicLink(), 'symlink output ancestor'); if (dirname(p) === p) break }
  try { lstatSync(out); throw new Error('output exists, including symlink') } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e }
  mkdirSync(out)
  const emit = (file: string, row: unknown): void => appendFileSync(resolve(out, file), stableStringify(row) + '\n', { flag: 'a' })
  const write = (file: string, row: unknown): void => writeFileSync(resolve(out, file), stableStringify(row) + '\n', { flag: 'wx' })
  const instrumented = mode !== 'clean'
  let currentWeek = -1, currentStudio: string | null = null, ordinal = 0
  let observationState: GameState | null = null, inputStateSha256: string | null = null
  let branchRows = 0, chooserRows = 0, evaluationRows = 0, entryRows = 0
  const decisions = new Map<string, number>(), packages = new Map<string, Record<string, unknown>>()
  const integrity: string[] = [], tickTimes: number[] = []
  const observed = (kind: string, facts: Record<string, unknown>): void => {
    branchRows++
    if (typeof facts.studioId === 'string') currentStudio = facts.studioId
    if (kind === 'decision-start') decisions.set(`${currentWeek}:${currentStudio}`, (decisions.get(`${currentWeek}:${currentStudio}`) ?? 0) + 1)
    if (kind === 'evaluation') evaluationRows++
    if (kind === 'termination-charge') {
      const f = facts as { cutting: number | null; cash: number; charge: number; saving: number; weeklyCostBefore: number; reserveAfter: number }
      requireFact(f.cash - f.charge >= f.reserveAfter, 'actual termination failed reserve')
      if (f.cutting !== null) requireFact(f.charge * f.weeklyCostBefore <= f.cash * f.saving, 'actual cutting termination failed scoped payback')
    }
    emit('branches.jsonl', { ordinal: ordinal++, inputWeek: currentWeek, outputWeek: currentWeek + 1, inputStateSha256, kind, facts })
  }
  const restores: (() => void)[] = []
  if (instrumented) {
    setMeasurementSink(row => observed(row.kind, row.facts))
    const actualSearch = policy.searchIndustryPackages
    const searchSpy=vi.spyOn(policy,'searchIndustryPackages').mockImplementation((input,posture,options)=>{
      const before=hash({input,posture,options:{...options,promisedMasks:[...(options.promisedMasks??[])]}})
      const result=actualSearch(input,posture,options)
      observed('actual-refusal-research',{studioId:options.key.split(':')[0],key:options.key,options:{...options,promisedMasks:[...(options.promisedMasks??[])]},result})
      requireFact(hash({input,posture,options:{...options,promisedMasks:[...(options.promisedMasks??[])]}})===before,'search arguments mutated')
      return result
    })
    restores.push(()=>searchSpy.mockRestore())
    const original = policy.chooseIndustryPackage
    const chooser = vi.spyOn(policy, 'chooseIndustryPackage').mockImplementation((input, posture, options) => {
      const before = hash({ input, posture, options: { ...options, promisedMasks: [...(options.promisedMasks ?? [])] } })
      const result = original(input, posture, options)
      const key = options.key; const studioId = key.split(':')[0]!
      const facts: Record<string, unknown> = { studioId, key, lockScreenplay: options.lockScreenplay, cashAvailable: options.cashAvailable, weeklyCost: options.weeklyCost, choice: result }
      if (options.lockScreenplay) {
        const mirror = packageFacts(input, posture, options)
        const actual = actualSearch(input, posture, options)
        requireFact(actual.affordable === mirror.affordable && actual.unaffordable === mirror.unaffordable && actual.viable === mirror.viable && hash(actual.choice) === hash(result), 'chooser/mirror counts or return drift')
        Object.assign(facts, mirror, { oldLabel: result !== null ? 'viable' : mirror.unaffordable > 0 ? 'cashBlocked' : 'economicRejection', amendedLabel: result !== null ? 'viable' : mirror.unaffordableViable > 0 ? 'cashBlocked' : 'economicRejection' })
      }
      if(!options.lockScreenplay){
        // Exact frozen six-shape menu; pricing only, no forecast or viability claim.
        const shapes=[['slowSetup','reversal','triumph'],['mysteryHook','reversal','triumph'],['mysteryHook','revelation','ambiguous'],['immediateAction','escalation','triumph'],['slowSetup','revelation','bittersweet'],['mysteryHook','escalation','tragic']] as const
        const costs:number[]=[];const planning=policy.perceivedPlanningInputs(input)
        const actors=[planning.cast.lead,planning.cast.antagonist,planning.cast.support]
        const billings=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]] as const
        for(const [opening,midpoint,ending] of shapes)for(const billing of billings){
          const shape={opening,midpoint,ending};const shapeEffects=resolveShape(shape)
          let inp={...planning,shape,shapeEffects,cast:{lead:actors[billing[0]]!,antagonist:actors[billing[1]]!,support:actors[billing[2]]!}}
          const center=forecastCenters(inp,true,true).core.delivered
          const range=(n:number):[number,number]=>[Math.max(-1,Math.min(1,n-TUNING.HOLLYWOOD_PROMISE_HALF_WIDTH)),Math.max(-1,Math.min(1,n+TUNING.HOLLYWOOD_PROMISE_HALF_WIDTH))]
          inp={...inp,promise:{...inp.promise,ranges:{intimacy:range(center.intimacy),tonalWeight:range(center.tonalWeight),kineticEnergy:range(center.kineticEnergy)}}}
          for(const scale of TUNING.HOLLYWOOD_NEGATIVE_CHOICES){
            const negative=Math.round(inp.concept.baseNegativeCost*shapeEffects.budgetDemandMultiplier*inp.era.costScale*scale*posture.negativeScale)
            const base={...inp,budget:{negative,marketing:0}}
            for(const marketing of marketingMenuFromCapacity(marketingCapacityForInputs(base,true)))costs.push(negative+marketing)
          }
        }
        facts.minimumPackageCost=Math.min(...costs);facts.maximumPackageCost=Math.max(...costs)
        facts.refusedPackageCostBasis='minimum actual six-shape/six-billing planning menu cost; same perceived inputs and authored promise ranges'
        if(result===null)requireFact(costs.every(cost=>cost>options.cashAvailable),'commission refusal not explained by cash menu')
      }
      // Commission has a different six-shape menu and no viability gate. Never reuse the locked mirror.
      chooserRows++; packages.set(`${currentWeek}:${studioId}`, clone(facts))
      observed('package', facts)
      requireFact(hash({ input, posture, options: { ...options, promisedMasks: [...(options.promisedMasks ?? [])] } }) === before, 'observer changed chooser arguments')
      return result
    })
    restores.push(() => chooser.mockRestore())
    const originalStanding=standingLaw.updateStanding
    const standingSpy=vi.spyOn(standingLaw,'updateStanding').mockImplementation((standing,result,benchmarks,ctx)=>{
      const after=originalStanding(standing,result,benchmarks,ctx)
      const star=(ctx.castFames.lead+ctx.castFames.antagonist+ctx.castFames.support)/300
      const deltaNeeded=Math.max(0,standing.audienceAwareness-TUNING.AWARENESS_DRIFT_ANCHOR)*(Math.pow(1-TUNING.AWARENESS_DRIFT_RATE,-9)-1)
      const reachNeeded=Math.max(0,(ctx.engaged?TUNING.AWARENESS_REACH_NEUTRAL_ENGAGED:TUNING.AWARENESS_REACH_NEUTRAL)+(deltaNeeded-TUNING.AWARENESS_STAR_WEIGHT*Math.min(1,Math.max(0,star)))/TUNING.AWARENESS_REACH_WEIGHT)
      const attainable=reachNeeded<=1&&deltaNeeded<=TUNING.AWARENESS_DELTA_CAP&&standing.audienceAwareness+deltaNeeded<=100
      const releaseOwner=observationState?.hollywood?.businesses.find(b=>b.productions.some(p=>p.id===result.productionId))?.studioId ?? (observationState?.studio.activeProductions.some(p=>p.id===result.productionId)?observationState.hollywood?.playerStudioId:null)
      observed('release-standing',{studioId:releaseOwner,before:standing,after,context:ctx,productionId:result.productionId,gross:result.boxOffice.total,grossNeededToHoldAwarenessAtNineWeekPace:attainable?reachNeeded*ctx.baseMarketValue*TUNING.AWARENESS_REACH_SCALE:null,awarenessBasis:'source release equation and nine authored drift steps, fixed actual release stars/market; model not guaranteed route'})
      return after
    })
    restores.push(()=>standingSpy.mockRestore())
    const optional = policy as unknown as Record<string, (...args: unknown[]) => unknown>
    for (const name of ['rivalCostCuttingEntry','rivalCostCuttingReleaseAllowed']) {
      if (typeof optional[name] !== 'function') { requireFact(arm === 'C0' || arm === 'A', 'missing recovery predicate'); continue }
      const originalFn = optional[name]!
      const spy = vi.spyOn(optional, name).mockImplementation((...args: unknown[]) => {
        const before = hash(args); const result = originalFn(...args)
        if (name === 'rivalCostCuttingEntry') entryRows++
        observed(name, { studioId: currentStudio, arguments: args, result, lastPackage: packages.get(`${currentWeek}:${currentStudio}`) ?? null })
        requireFact(hash(args) === before, 'observer changed predicate inputs')
        return result
      })
      restores.push(() => spy.mockRestore())
    }
  }
  const condition = new Map<string, { a: Track; b: Track }>()
  const stats = new Map<string, { firstBelowReserve: number | null; firstNonpositive: number | null; minimumCash: number; firstEntry: number | null; firstsAfterEntry: Record<string, number>; lastGreenlight: number | null; longestGreenlightGap: number }>()
  const annual: unknown[] = []
  let state = p13aGeneratedStudio(seed)
  const genesisBefore=hash(state)
  const initialSave = makeSave(state)
  requireFact(hash(state)===genesisBefore,'writer changed genesis')
  requireFact(state.hollywood!.businesses.every(b=>optionalSince(b)===null),'natural genesis contains recovery history')
  requireFact(initialSave.saveVersion === manifest.saveVersion, 'actual writer/version mismatch')
  const genesisSha256 = hash(state)
  const initialRng = state.rngState
  const firstCounts = { receipts: state.hollywood!.receipts.length, takes: state.firstTakes.length }
  const sample = (s: GameState): void => {
    const h = s.hollywood!, week = s.market.tick
    if(arm==='AB'){requireFact(!h.receipts.some(r=>(r as {kind:string}).kind==='facilityDisposed'),'AB unexpectedly disposed a body');requireFact(h.businesses.every(b=>b.account.periods.every(p=>((p.movements as unknown as Record<string,number>).facilityDemolitionRefund??0)===0)),'AB refund must remain zero at every week')}
    const businesses = h.businesses.map(b => {
      const employment = h.activeEmploymentOrdinals.map(i => h.employment[i]!).filter(e => e.studioId === b.studioId)
      const headcount: Record<string, number> = {}
      for (const e of employment) { const role = s.talent.find(t => t.id === e.terms.talentId)!.role; headcount[role] = (headcount[role] ?? 0) + 1 }
      const cost = rivalWeeklyOperatingCost(b, h, week), reserve = cost * b.policy.reserveWeeks
      let st = stats.get(b.studioId)
      if (!st) { st = { firstBelowReserve: null, firstNonpositive: null, minimumCash: b.account.cash, firstEntry: null, firstsAfterEntry: {}, lastGreenlight: null, longestGreenlightGap: 0 }; stats.set(b.studioId, st) }
      if (b.account.cash < reserve) st.firstBelowReserve ??= week
      if (b.account.cash <= 0) st.firstNonpositive ??= week
      st.minimumCash = Math.min(st.minimumCash, b.account.cash)
      st.firstEntry ??= optionalSince(b)
      if (st.lastGreenlight !== null) st.longestGreenlightGap = Math.max(st.longestGreenlightGap, week - st.lastGreenlight)
      const shadow = condition.get(b.studioId)
      return { studioId: b.studioId, cash: b.account.cash, reserve, difference: b.account.cash - reserve, weeklyOperatingCost: cost, payroll: employment.reduce((n,e) => n + weeklySalary(e.terms.annualSalary), 0), facilityOpex: rivalCapacityOpex(b,h.receipts), headcount, employment: employment.map(e => e.contractId), accountSha256: hash(b.account), emptyRefundComparableAccountSha256: comparableAccount(b), movements: sums(b), since: optionalSince(b), productionCount: b.productions.length, runCount: b.runs.length, scripts: b.development.projects.map(p => ({ id: p.id, status: p.status })), activeOrdinals: b.activeScriptOrdinals, shelving: b.screenplayShelving, facilities: b.operations.facilities, research: s.technology.projects.filter(p=>p.studioId===b.studioId).map(({weeks,...project})=>({...project,workReceiptCount:weeks.length,workReceiptSha256:hash(weeks)})), adoptions:s.technology.adoptions.filter(a=>a.studioId===b.studioId), plans:s.physicalPlans.plans.filter(p=>p.studioId===b.studioId), standing: b.standing, stats: clone(st), shadow: shadow ? clone(shadow) : null, dormantSurvivorA: st.firstEntry !== null && shadow?.a.condition?.stage !== 'closed' && st.firstsAfterEntry.greenlight === undefined, dormantSurvivorB: st.firstEntry !== null && shadow?.b.condition?.stage !== 'closed' && st.firstsAfterEntry.greenlight === undefined }
    })
    emit('weekly.jsonl', { week, stateSha256: hash(s), emptyRecoveryComparableSha256: emptyRecoveryProjection(s), rngSha256: hash(s.rngState), baseMarketValue: s.market.baseMarketValue, player: { cash: s.studio.cash, contracts: s.contracts.length, productions: s.studio.activeProductions.length }, businesses })
    if (week % 52 === 0 || week === 520) annual.push({ week, studios: h.businesses.map(b => ({ studioId: b.studioId, periods: b.account.periods })) })
  }
  sample(state)
  try {
    for (let week = 0; week < 520; week++) {
      currentWeek = week; currentStudio = null
      const pre = state, beforeHash = hash(pre)
      observationState=pre;inputStateSha256=beforeHash
      const started = performance.now(); state = tick(pre); tickTimes.push(performance.now() - started)
      requireFact(state.market.tick === week + 1 && hash(pre) === beforeHash, 'tick changed input or week')
      const h = state.hollywood!, ph = pre.hollywood!
      requireFact(hash(h.receipts.slice(0, ph.receipts.length)) === hash(ph.receipts), 'receipt history changed')
      requireFact(hash(state.firstTakes.slice(0, pre.firstTakes.length)) === hash(pre.firstTakes), 'first-take history changed')
      const receipts = h.receipts.slice(ph.receipts.length)
      emit('research.jsonl',{inputWeek:week,outputWeek:week+1,projects:state.technology.projects.map(p=>{const old=pre.technology.projects.find(q=>q.id===p.id);return {id:p.id,studioId:p.studioId,newProject:old===undefined,verifiedWorkBefore:old?.verifiedWork??0,verifiedWorkAfter:p.verifiedWork,expenditureBefore:old?.expenditure??0,expenditureAfter:p.expenditure,seats:p.seats,newWork:p.weeks.slice(old?.weeks.length??0)}})})
      emit('receipts.jsonl', { inputWeek: week, outputWeek: week + 1, receipts, firstTakes: state.firstTakes.slice(pre.firstTakes.length), removedProposalVersions: pre.talentMarket.proposals.filter(p => !state.talentMarket.proposals.some(q => q.digest === p.digest && q.issuerStudioId === p.issuerStudioId && q.talentId === p.talentId)).map(p => ({ talentId:p.talentId, issuerStudioId:p.issuerStudioId, digest:p.digest, submittedWeek:p.submittedWeek })) })
      for (const b of h.businesses) {
        const old = ph.businesses.find(x => x.studioId === b.studioId)
        const before = old ? sums(old) : {}, after = sums(b), delta: Record<string, number> = {}
        for (const k of new Set([...Object.keys(before), ...Object.keys(after)])) delta[k] = (after[k] ?? 0) - (before[k] ?? 0)
        requireFact(near(b.account.cash - (old?.account.cash ?? b.account.openingBalance), Object.values(delta).reduce((n,x) => n + x, 0)), 'weekly account movement mismatch')
        for (const p of b.account.periods) requireFact(near(p.opening + Object.values(p.movements).reduce((n,x) => n+x,0), p.closing), 'period balance mismatch')
        const owned = receipts.filter(r => r.studioId === b.studioId)
        const refunds = owned.filter(r => (r as { kind: string }).kind === 'facilityDisposed') as unknown as { refund: number; facilityId: string; planId: string; eventId: string; week: number }[]
        requireFact(near(delta.facilityDemolitionRefund ?? 0, refunds.reduce((n,r) => n+r.refund,0)), 'refund receipt/movement mismatch')
        const termination = owned.filter(r => r.kind === 'employment' && r.reason === 'termination')
        const charge = termination.reduce((n,r) => {
          if (r.kind !== 'employment') return n
          const contract = h.employment.find(e => e.contractId === r.contractId)!
          return n + weeklySalary(contract.terms.annualSalary) * Math.min(TUNING.HIRING_TERMINATION_CAP_WEEKS, contract.terms.endWeekExclusive - r.week)
        }, 0)
        requireFact(near(-(delta.termination ?? 0), charge), 'termination receipt/movement mismatch')
        emit('money.jsonl', { inputWeek: week, outputWeek: week+1, studioId: b.studioId, cashBefore: old?.account.cash ?? b.account.openingBalance, cashAfter: b.account.cash, delta, termination, refunds })
        let st = stats.get(b.studioId)
        // New entrants are sampled below; their current events are retained in receipts regardless.
        if (st) {
          st.firstEntry ??= optionalSince(b)
          const marks: [string, boolean][] = [['hire', owned.some(r=>r.kind==='employment' && r.toStudioId===b.studioId)], ['commission', b.development.projects.length>(old?.development.projects.length??0)], ['greenlight', owned.some(r=>r.kind==='filmAnnounced')], ['firstTake', state.firstTakes.slice(pre.firstTakes.length).some(t=>t.studioId===b.studioId)], ['release', owned.some(r=>r.kind==='filmReleased')], ['revenue',(delta.studioRevenue??0)>0], ['cashAboveReserve', b.account.cash>=rivalWeeklyOperatingCost(b,h,week+1)*b.policy.reserveWeeks]]
          for (const [kind, present] of marks) if (present && st.firstEntry !== null && week > st.firstEntry) st.firstsAfterEntry[kind] ??= week
          if (marks.find(([k])=>k==='greenlight')![1]) { if (st.lastGreenlight!==null) st.longestGreenlightGap=Math.max(st.longestGreenlightGap,week-st.lastGreenlight); st.lastGreenlight=week }
        }
      }
      // Exact 1357-P shadow adapter at ARRIVED week. These loans never mutate game cash or restart behavior.
      const ids = h.businesses.map(b=>b.studioId)
      if (economyEngaged(state) && state.founding===null) ids.push(h.playerStudioId)
      for (const id of ids) {
        const isPlayer=id===h.playerStudioId, b=h.businesses.find(x=>x.studioId===id)
        const cost=isPlayer?weeklyPayroll(state)+weeklyOverhead(state)+weeklyFacilityOperatingCost(state):rivalWeeklyOperatingCost(b!,h,week+1)
        const cash=isPlayer?state.studio.cash:b!.account.cash
        requireFact(cost>0,'evaluated shadow studio must have positive fixed cost')
        let row=condition.get(id); if(!row){row={a:track(),b:track()};condition.set(id,row)}
        if(row.b.loan){const paid=loanInstallmentDue(row.b.loan,week);row.b.delta-=paid;row.b.installmentsPaid+=paid}
        conditionStep(row.a,week+1,cash,cost,0)
        if(!isPlayer){
          conditionStep(row.b,week+1,cash+row.b.delta,cost,row.b.loan?loanInstallmentDue(row.b.loan,week+1):0)
          const outstanding=row.b.loan!==null&&week+1<=row.b.loan.contractedWeek+row.b.loan.installments.length
          if(row.b.condition?.stage==='distress'&&loanEligible('distress',cost,{hasOutstandingLoan:outstanding,founding:false})){
            row.b.loan=contractLoan(loanMaxPrincipal(cost),cost,week+1);row.b.loans.push(row.b.loan);row.b.delta+=row.b.loan.principal
          }
        }
      }
      sample(state)
    }
  } finally { setMeasurementSink(null); for(const restore of restores.reverse())restore() }
  if(instrumented) requireFact(branchRows>0 && chooserRows>0 && evaluationRows>0 && (arm==='C0'||arm==='A'||entryRows>0),'observer binding/coverage missing')
  const stateBeforeSave=hash(state), finalSave=makeSave(state)
  requireFact(hash(state)===stateBeforeSave && finalSave.saveVersion===manifest.saveVersion,'writer mutation or final era mismatch')
  write('annual.json',annual)
  write('summary.json',{arm,seed,mode,week:520,sourceIdentity:manifest.sourceIdentity,manifestSha256:manifestPin,pressure:'as-authored',genesisSha256,initialRngSha256:hash(initialRng),finalStateSha256:hash(state),finalRngSha256:hash(state.rngState),finalSaveSha256:hash(finalSave),finalSaveBytes:Buffer.byteLength(stableStringify(finalSave)),firstCounts,branchRows,chooserRows,evaluationRows,entryRows,stats:[...stats].map(([studioId,row])=>({studioId,...row})),shadow:[...condition].map(([studioId,row])=>({studioId,...row})),films:state.hollywood!.films.filter(f=>f.provenance==='simulation/v1'),integrity,limits:['520 only; no 521 historical summary','no 154 historical attribution','no 6240 condition verdict or G-P/G-L','no actual loans or closure','pressure as authored; enabled-pressure followup separate','sustainable operations is an economic measurement, not survival or temporary positive cash']})
  write('timing.json',{mode,tickMs:tickTimes,totalTickMs:tickTimes.reduce((n,x)=>n+x,0),instrumented,meaning:instrumented?'includes observer and mirror cost':'ordinary tick wall time; sampling and save excluded',ceiling:'no per-seed/per-tick acceptance threshold invented; original 1356 whole-harness 300000 ms remains separate'})
},300_000)
