import { useState } from 'react'
import { studioCorporateView, type GameState, type ActionOutcome } from '../engine/adapter.ts'
import { moneyExact } from '../format.ts'

/** Presentation of the existing core notice/remedy/loan owners; no new financial arithmetic. */
export function CorporateConditionPanel({ state, onTakeLoan, onReduceObligations, onRelease }: {
  state: GameState
  onTakeLoan: (principal: number) => ActionOutcome
  onReduceObligations: () => void
  onRelease: () => void
}) {
  const [selected, setSelected] = useState<number | undefined>()
  const [error, setError] = useState<string | null>(null)
  const view = studioCorporateView(state, selected)
  if (view.notices.length === 0) return null
  return <section aria-label="Corporate condition" className="panel">
    {view.notices.map(notice => <p key={notice.id} role={notice.severity === 'critical' ? 'alert' : 'status'}>{notice.message}</p>)}
    {view.remedies.includes('REDUCE_OBLIGATIONS') && <button type="button" onClick={onReduceObligations}>Review contracts to release</button>}
    {view.remedies.includes('RELEASE') && <button type="button" onClick={onRelease}>Review pictures in release</button>}
    {view.loan !== null && <section aria-label="Studio loan offer" className="panel">
      <h2>Studio loan</h2>
      <label>Loan principal <select aria-label="Loan principal" value={view.loan.principal}
        onChange={event => { setSelected(Number(event.target.value)); setError(null) }}>
        {view.loanPrincipals.map(principal => <option key={principal} value={principal}>Borrow {moneyExact(principal)}</option>)}
      </select></label>
      <dl><dt>Principal</dt><dd>{moneyExact(view.loan.principal)}</dd><dt>Total repayment</dt><dd>{moneyExact(view.loan.total)}</dd></dl>
      <p>Flat interest is included in the total. One loan at a time; no early repayment. Installments are charged with payroll even when cash is negative.</p>
      <table aria-label="Studio loan repayment schedule"><thead><tr><th>Due</th><th>Installment</th></tr></thead><tbody>
        {view.loan.installments.map((amount, i) => <tr key={i}><td>Week {view.loan!.contractedWeek + i + 1}</td><td>{moneyExact(amount)}</td></tr>)}
      </tbody></table>
      <button type="button" onClick={() => {
        const result = onTakeLoan(view.loan!.principal)
        if (!result.ok) setError(result.error)
      }}>Take a studio loan of {moneyExact(view.loan.principal)}</button>
    </section>}
    {error && <p role="alert">{error}</p>}
  </section>
}
