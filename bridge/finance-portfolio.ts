import type { GameState } from '../src/core/types.ts'
import { scriptProjectsReadModel } from '../src/core/scriptReadModel.ts'
import { productionBoard } from '../ui/src/engine/adapter.ts'
import { releaseCommitmentFor } from '../src/core/releaseAuthority.ts'
import type { FinanceFilm } from './finance.ts'
import type { FinanceRoute } from './finance-route.ts'

export type FinancePortfolioPhase = 'developmentPackage' | 'production' | 'postReleaseReady' | 'inTheaters' | 'completed'
export type FinancePortfolioRow = {
  id: string; identityKind: 'scriptProject' | 'production'; projectId: string | null; productionId: string | null
  title: string; phase: FinancePortfolioPhase; phaseLabel: string; timingWeek: number | null
  phaseWeeksRemaining: number | null; timingLabel: string; hasDecisionOrBlocker: boolean; decisionLine: string
  commitmentState: 'uncommitted' | 'recorded' | 'notRecorded'; directCommitment: number | null
  studioRevenueReceived: number | null; studioRevenueRemaining: number | null; studioRevenueTotal: number | null
  contribution: number | null; contributionLabel: string; basis: string; routes: FinanceRoute[]
}
const PHASE_ORDER: Record<FinancePortfolioPhase, number> = {
  developmentPackage: 0, production: 1, postReleaseReady: 2, inTheaters: 3, completed: 4,
}
const compareId = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0

/** Full public pipeline; no title joins, fictional productions or unreleased forecasts. */
export function financePortfolio(state: GameState, films: FinanceFilm[]) {
  const scripts = scriptProjectsReadModel(state)
  const projects = Object.values(scripts.sections).flat()
  const productionProjects = new Map(projects.flatMap(p => p.productionId === null ? [] : [[p.productionId, p.projectId] as const]))
  const board = new Map(productionBoard(state).cards.map(card => [card.productionId, card]))
  const rows: FinancePortfolioRow[] = projects.filter(p => p.productionId === null).map(project => {
    const session = state.castingSessions.sessions.find(s => s.projectId === project.projectId)
    const queued = state.productionQueue.some(q => q.kind === 'greenlightScriptProject' && q.scriptProjectId === project.projectId)
    const review = project.status === 'review' || session?.status === 'review'
    const dueWeek = session?.status === 'auditioning' ? session.dueWeek : project.dueWeek
    const routes: FinanceRoute[] = [{ kind: 'development', targetId: project.projectId, label: 'Open Development' }]
    if (project.status === 'ready' && state.castingSessions.mode === 'managed') {
      routes.push({ kind: 'casting', targetId: project.projectId, label: 'Open Casting / Package' })
    }
    return { id: `project:${project.projectId}`, identityKind: 'scriptProject', projectId: project.projectId, productionId: null,
      title: project.title, phase: 'developmentPackage',
      phaseLabel: queued ? 'Greenlight queued · not committed' : session?.status === 'auditioning' ? 'Camera tests' : project.lifecycleLabel,
      timingWeek: dueWeek, phaseWeeksRemaining: null,
      timingLabel: dueWeek === null ? 'No committed completion date' : `Decision due Week ${dueWeek}`,
      hasDecisionOrBlocker: review || project.blockers.length > 0,
      decisionLine: review ? (session?.status === 'review' ? 'Review camera tests' : 'Review screenplay')
        : project.blockers.map(b => b.headline).join(' · ') || project.consequence,
      commitmentState: 'uncommitted', directCommitment: null, studioRevenueReceived: null,
      studioRevenueRemaining: null, studioRevenueTotal: null, contribution: null,
      contributionLabel: 'Film Contribution not yet available',
      basis: 'No production budget or freelancer fee has been committed. Existing studio payroll is separate. Commercial return is not known.', routes }
  })
  for (const film of films) {
    const current = board.get(film.productionId)
    const released = film.resultAvailable
    const releaseReady = current !== undefined && current.weeksRemaining === 1
    const committedRelease = releaseCommitmentFor(state.releaseAuthority, film.productionId)
    const releaseDecision = releaseReady && committedRelease === null
    const phase: FinancePortfolioPhase = released ? film.status === 'releasing' ? 'inTheaters' : 'completed'
      : releaseReady || current?.phase === 'postProduction' || current?.phase === 'releaseReady' ? 'postReleaseReady' : 'production'
    const routes: FinanceRoute[] = released
      ? [{ kind: 'releaseResult', targetId: film.productionId, label: 'Open Release Result' },
        { kind: 'filmHistory', targetId: film.productionId, label: 'Open Film Chronicle' }]
      : [{ kind: 'production', targetId: film.productionId, label: 'Open Production' }]
    rows.push({ id: `production:${film.productionId}`, identityKind: 'production',
      projectId: productionProjects.get(film.productionId) ?? null, productionId: film.productionId, title: film.title,
      phase, phaseLabel: released ? film.status === 'releasing' ? 'In theaters' : 'Completed'
        : releaseReady ? 'Release Ready' : current?.phaseLabel ?? 'In production',
      timingWeek: released ? film.releaseWeek : null,
      phaseWeeksRemaining: released ? (film.status === 'releasing' ? film.remainingWeeks : null) : current?.weeksRemaining ?? null,
      timingLabel: released ? `${film.releaseWeek === null ? 'Release week not recorded' : `Released Week ${film.releaseWeek}`}; ${film.status === 'releasing' ? `${film.remainingWeeks} receipt weeks remain` : 'run completed'}`
        : releaseReady ? (committedRelease === null ? 'Awaiting a release decision; no release date committed' : 'Release committed for the next advance')
          : `${current?.weeksRemaining ?? 'Unknown'} production weeks remain; holds can extend the schedule`,
      hasDecisionOrBlocker: releaseDecision || current?.command != null || current?.blocker != null,
      decisionLine: releaseDecision ? 'Decide whether to release or hold' : current?.blocker?.headline ?? current?.command?.label
        ?? (film.status === 'releasing' ? 'Receipt on the next advance' : current?.statusLabel ?? 'No outstanding decision'),
      commitmentState: film.directCommitment === null ? 'notRecorded' : 'recorded', directCommitment: film.directCommitment,
      studioRevenueReceived: released ? film.studioRevenueReceived : null, studioRevenueRemaining: film.studioRevenueRemaining,
      studioRevenueTotal: film.studioRevenueTotal, contribution: film.contribution,
      contributionLabel: film.contributionLabel, basis: film.basis, routes })
  }
  rows.sort((a, b) => Number(b.hasDecisionOrBlocker) - Number(a.hasDecisionOrBlocker)
    || PHASE_ORDER[a.phase] - PHASE_ORDER[b.phase]
    || (a.timingWeek ?? Infinity) - (b.timingWeek ?? Infinity)
    || compareId(a.id, b.id))
  return { defaultSort: 'attentionPhaseTime' as const, rows,
    basis: 'Unresolved authoritative decisions or blockers first, then pipeline phase and recorded/due week. Development uses exact screenplay IDs until a real production is admitted. Film Contribution excludes studio operating costs and is not studio net profit.' }
}
