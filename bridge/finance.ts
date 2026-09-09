/** P11 composes existing owners into a player-safe Finance read model. */
import type { GameState } from '../src/core/types.ts'
import { financeOverview } from '../src/core/financeReport.ts'
import { blueprintById } from '../src/core/placement.ts'
import { filmCommittedCost } from '../src/core/receptionVerdict.ts'
import { filmResultView } from '../ui/src/engine/adapter.ts'
import type { BridgePeopleProjection } from './people.ts'

export type FinanceFilm = {
  productionId: string; title: string; status: string; releaseWeek: number | null; resultAvailable: boolean;
  theatricalGross: number | null; studioRevenueReceived: number; studioRevenueTotal: number | null;
  studioRevenueRemaining: number | null; remainingWeeks: number; directCommitment: number | null;
  productionAndMarketing: number | null; freelancerFees: number | null; contribution: number | null;
  contributionLabel: string; basis: string;
}
export function financeProjection(state: GameState, people: BridgePeopleProjection) {
  const overview = financeOverview(state)
  const employees = people.profiles.flatMap(p => {
    const c = p.employment.contract
    return c === null ? [] : [{ talentId: p.talentId, name: p.name, profession: p.professionLabel,
      weeklySalary: c.weeklySalary, chargedNextAdvance: state.founding === null ? c.weeklySalary : 0,
      endWeekExclusive: c.endWeekExclusive, remainingWeeks: c.remainingWeeks,
      guaranteedRemaining: c.guaranteedRemaining, terminationCost: c.terminationCost,
      renewalOpen: c.renewalOpen, renewalLine: c.renewalLine }]
  }).sort((a,b) => b.weeklySalary-a.weeklySalary || a.talentId.localeCompare(b.talentId))
  const facilities = state.placement.facilities.map(p => {
    const blueprint = blueprintById(p.blueprintId)
    return { placementId: p.id, buildingId: `placed-${p.id}`, facilityId: p.facilityId,
      projectId: p.projectId, name: blueprint?.name ?? p.blueprintId, status: p.status,
      completesWeek: p.completesWeek, weeklyOperatingCost: blueprint?.weeklyOperatingCost ?? 0,
      chargedNextAdvance: state.founding === null && p.status === 'operational' ? blueprint?.weeklyOperatingCost ?? 0 : 0,
      capacity: blueprint?.capacity ?? 0, capability: blueprint?.capability ?? null,
      onsetLine: p.status === 'operational' ? 'Operational · included in the next advance'
        : `Completes on arrival in Week ${p.completesWeek}; operating costs first charge on Week ${p.completesWeek} → ${p.completesWeek+1}.`,
    }
  })
  const films: FinanceFilm[] = state.studio.releasedFilms.map(f => {
    const business = filmResultView(state, f).business
    const rows = state.ledger.filter(e => e.productionId === f.productionId && (e.kind === 'production' || e.kind === 'freelancerFee'))
    const costRecorded = rows.some(e => e.kind === 'production')
    const run = state.theatricalRuns.find(r => r.productionId === f.productionId)
    const title = state.studioHistory.rows.find(e => e.kind === 'filmReleased' && e.productionId === f.productionId)
    return { productionId: f.productionId, title: state.concepts.find(c => c.id === f.conceptId)?.title ?? (title?.kind === 'filmReleased' ? title.title : f.productionId),
      status: business.projected ? 'releasing' : business.runStatus === 'legacyCompleted' || business.runStatus === 'none' ? 'legacy' : 'settled',
      releaseWeek: f.releaseTick, resultAvailable: true,
      theatricalGross: business.boxOfficeGrossTotal, studioRevenueReceived: business.studioRevenuePaidToDate,
      studioRevenueTotal: business.studioRevenueTotal,
      studioRevenueRemaining: Math.max(0, business.studioRevenueTotal-business.studioRevenuePaidToDate),
      remainingWeeks: run === undefined ? 0 : Math.max(0, run.totalWeeks-run.weekIndex),
      directCommitment: costRecorded ? business.committedCost : null,
      productionAndMarketing: costRecorded ? -rows.filter(e=>e.kind==='production').reduce((sum,e)=>sum+e.amount,0) : null,
      freelancerFees: costRecorded || rows.some(e=>e.kind==='freelancerFee') ? -rows.filter(e=>e.kind==='freelancerFee').reduce((sum,e)=>sum+e.amount,0) : null,
      contribution: costRecorded ? business.contribution : null,
      contributionLabel: business.projected ? 'Projected Film Contribution' : 'Final Film Contribution',
      basis: costRecorded ? 'Full-run Studio Revenue minus recorded direct commitments. Older production entries may bundle talent fees into production spending. Excludes studio payroll, overhead, facility costs, capital and publicity; this is not studio net profit.'
        : 'A complete production commitment was not recorded for this film. Any retained freelancer payments are shown separately. Contribution is unavailable; the original film result retains its accepted historical basis.',
    }
  })
  for (const p of state.studio.activeProductions) {
    const rows = state.ledger.filter(e => e.productionId === p.id && (e.kind==='production'||e.kind==='freelancerFee'))
    const recorded = rows.some(e => e.kind === 'production')
    films.push({ productionId:p.id, title:state.concepts.find(c=>c.id===p.conceptId)?.title ?? p.id,
      status:'inProduction', releaseWeek:null, resultAvailable:false,
      theatricalGross:null, studioRevenueReceived:0, studioRevenueTotal:null, studioRevenueRemaining:null, remainingWeeks:0,
      directCommitment:recorded?filmCommittedCost(state,p.id):null,
      productionAndMarketing:recorded?-rows.filter(e=>e.kind==='production').reduce((s,e)=>s+e.amount,0):null,
      freelancerFees:recorded || rows.some(e=>e.kind==='freelancerFee')?-rows.filter(e=>e.kind==='freelancerFee').reduce((s,e)=>s+e.amount,0):null,
      contribution:null, contributionLabel:'Film Contribution not yet available',
      basis:'Direct commitments already paid. Revenue and Contribution are unavailable until release; no unreleased-film forecast is included in current pace.' })
  }
  // JSON has one zero; preserve exact response replay across serialization.
  for (const film of films) {
    if (film.freelancerFees === 0) film.freelancerFees = 0
    if (film.productionAndMarketing === 0) film.productionAndMarketing = 0
  }
  return { ...overview, employees, facilities, films,
    guaranteedPayrollRemaining: employees.reduce((sum,e)=>sum+e.guaranteedRemaining,0),
    obligationsBasis:'Contract guarantees describe future payroll under existing terms. They are not an additional charge and are not subtracted from Cash. Signing bonuses already paid are excluded.',
    operationsBasis:'Ordinary overhead and operational facility costs are recurring. Construction capital and one-time Set repairs are recorded separately. Builder employment costs are not modeled.',
    attention: [ ...(overview.runwayState==='inRed'?['Cash is in the red. Current receipts and existing obligations remain visible; voluntary decisions follow their own affordability rules.']:[]),
      ...(employees.some(e=>e.renewalOpen)?[`${employees.filter(e=>e.renewalOpen).length} employee contract(s) are in their renewal window. Review Payroll.`]:[]),
      ...(overview.coverageNotice===null?[]:['Earlier financial history is incomplete. See recording coverage before comparing periods.']) ],
  }
}
