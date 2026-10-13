import { findConcept, studioCorporateView, type GameState } from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'

const words = (key: string) => key.replace(/([a-z])([A-Z])/g, '$1 $2').replaceAll('-', ' ')
const paymentLabels = { paid: 'Paid in full', partiallyPaid: 'Partially paid', unpaid: 'Unpaid', unpaidArchived: 'Archived — unpaid' } as const
const outcomeLabels = { held: 'Achieved', notHeld: 'Not achieved', notRecorded: 'Not recorded' } as const
const sourceLabels: Record<string, string> = { playerFilms: 'Your films', industryFilms: 'Industry films', playerRuns: 'Your theatrical runs', playerCareerEvents: 'Your career history', industryCareerEvents: 'Industry career history', technologyAdoptions: 'Technology installations', technologyCatalogue: 'Technology catalogue', powerRanking: 'Studio rankings', corporateCondition: 'Studio condition history', marketAssessments: 'Market assessments', studioClosures: 'Actual studio closures', awards: 'Awards' }
const sourceLabel = (key: string) => sourceLabels[key] ?? words(key)

/** Resolve retained names only; unknown identities remain explicit rather than invented. */
function retainedSubject(state: GameState, kind: string, id: string): string {
  if (kind === 'employment') {
    const interval = state.hollywood?.employment.find(e => e.contractId === id)
    const name = state.talent.find(t => t.id === interval?.terms.talentId)?.name
    if (name !== undefined) return name
  }
  if (kind === 'screenplay') {
    const script = state.scriptDevelopment.projects.find(p => p.id === id)
    if (script !== undefined) return findConcept(state, script.conceptId)?.title ?? 'Retained screenplay'
  }
  if (kind === 'production' || kind === 'theatricalRun' || kind === 'title') {
    const film = state.studio.releasedFilms.find(f => f.productionId === id)
    if (film !== undefined) return findConcept(state, film.conceptId)?.title ?? 'Retained released film'
    const production = state.studio.activeProductions.find(p => p.id === id)
    if (production !== undefined) return findConcept(state, production.conceptId)?.title ?? 'Retained production'
  }
  if (kind === 'research') {
    const project = state.technology.projects.find(p => p.id === id)
    if (project !== undefined) return words(project.technologyId)
  }
  if (kind === 'adoption') {
    const adoption = state.technology.adoptions.find(p => p.id === id)
    if (adoption !== undefined) return words(adoption.technologyId)
  }
  if (kind === 'physicalPlan') {
    const plan = state.physicalPlans.plans.find(p => p.id === id)
    if (plan !== undefined) return words(plan.work.blueprintId)
  }
  if (kind === 'facility') {
    const facility = state.placement.facilities.find(p => String(p.id) === id)
    if (facility !== undefined) return words(facility.blueprintId)
  }
  if (kind === 'cash') return 'Studio cash'
  if (kind === 'loan') return 'Studio loan'
  return `Retained ${words(kind)} (name unavailable)`
}

/** Stored terminal authority only. Nothing here advances, recomputes a Legacy, or offers operating actions. */
export function ClosedStudioHistory({ state, fromLot, onSaves, onHistory }: {
  state: GameState; fromLot: boolean; onSaves: () => void; onHistory: () => void
}) {
  const view = studioCorporateView(state)
  const terminal = view.terminal
  if (terminal === null) return null
  const closure = state.studioClosure.closures.find(c => c.closureId === terminal.closureId)!
  const claims = state.studioClosure.claims.filter(c => c.closureId === closure.closureId)
  const ended = state.campaignLegacy.endOfRun!
  return <main className="app-shell">
    <h1>Closed studio — read-only history</h1>
    <p>Week {closure.closureWeek}</p>
    {view.notices.map(n => <p key={n.id} role="status">{n.message}</p>)}
    <button type="button" disabled data-testid="lot-advance-week">Advance one week</button>
    <button type="button" data-testid={fromLot ? 'lot-open-saves' : 'open-saves'} onClick={onSaves}>Export or load a save</button>
    <button type="button" onClick={onHistory}>Studio history</button>
    <section aria-label="Employment claims"><h2>Employment claims</h2>
      {claims.length === 0 ? <p>No employment claims.</p> : <table><thead><tr><th>Claimant</th><th>Original</th><th>Paid</th><th>Unpaid</th><th>Status</th></tr></thead><tbody>
        {claims.map(c => <tr key={c.claimId}><td>{state.talent.find(t => t.id === c.claimantTalentId)?.name ?? 'Former employee (name unavailable)'}</td><td>{moneyExact(c.original)}</td><td>{moneyExact(c.paid)}</td><td>{moneyExact(c.unpaid)}</td><td>{paymentLabels[c.status]}{state.talent.some(t => t.id === c.claimantTalentId) ? null : <details><summary>Saved claimant reference</summary>{c.claimantTalentId}</details>}</td></tr>)}
      </tbody></table>}
    </section>
    <section aria-label="Terminal obligations"><h2>Retained obligations</h2>
      <ul>{closure.dispositions.map((d, i) => <li key={i}>
        {retainedSubject(state, d.subjectKind, d.subjectId)} — {d.status === 'pending' ? 'Unresolved obligation retained in this saved world' : 'Disposition recorded at closure'}
        <details><summary>Recorded history details</summary><p>{d.result}</p><p>Saved reference: {d.subjectId}</p></details>
      </li>)}</ul>
    </section>
    <section aria-label="Ended run"><h2>Ended run</h2><p>Recorded through Week {closure.closureWeek}. This is the ended run, not a new official 2040 assessment.</p>
      {ended.studios.map(s => <section key={s.studioId}><h3>{state.hollywood!.identities.find(i => i.studioId === s.studioId)?.name ?? s.studioId}</h3>
        <ul>{s.archetypes.map(a => <li key={a.archetypeId}>{words(a.archetypeId)}: {outcomeLabels[a.outcome]}; {a.qualifyingCount} qualifying, {a.contraryCount} contrary{a.limitedBy.length ? `; limited by ${a.limitedBy.map(sourceLabel).join(', ')}` : ''}</li>)}</ul>
      </section>)}
    </section>
    {state.campaignLegacy.official && <section aria-label="Official 2040 Legacy"><h2>Official 2040 Legacy</h2><p>The previously recorded official assessment is retained unchanged.</p>
      {state.campaignLegacy.official.studios.map(s => <div key={s.studioId}><h3>{state.hollywood!.identities.find(i => i.studioId === s.studioId)?.name ?? s.studioId}</h3><ul>{s.archetypes.map(a => <li key={a.archetypeId}>{words(a.archetypeId)}: {outcomeLabels[a.outcome]}</li>)}</ul></div>)}
    </section>}
  </main>
}
