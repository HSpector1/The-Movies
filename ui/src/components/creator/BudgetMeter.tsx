// ── Creation-budget meter (D-9.14) ───────────────────────────────────────────
// Shows live spend against the fixed AUTHORED_BUDGET pool, broken out per cost
// center, with a bar and an OVER-BUDGET flag. When over budget the meter turns
// danger-coloured and the caller disables submit — but the ENGINE is still the sole
// authority: an over-budget request is rejected loudly by createTalent regardless.
//
// Presentation only; the arithmetic comes from the adapter's previewCreationBudget,
// which mirrors the engine's authoredTotalCost exactly.

import type { BudgetPreview } from '../../engine/adapter.ts'

export function BudgetMeter({ preview }: { preview: BudgetPreview }) {
  const pct = Math.max(0, Math.min(100, (preview.total / preview.budget) * 100))
  const over = preview.overBudget
  return (
    <div className="card stack" data-testid="creator-budget">
      <div className="spread">
        <strong>Creation budget</strong>
        <span className="mono" data-testid="creator-budget-total">
          {preview.total.toFixed(1)} / {preview.budget}
        </span>
      </div>
      <div
        className="meter"
        aria-label={`Creation budget ${preview.total.toFixed(1)} of ${preview.budget} spent`}
      >
        <span
          className={over ? 'neg' : undefined}
          style={{
            width: `${pct}%`,
            background: over ? 'var(--danger, #c0392b)' : undefined,
          }}
        />
      </div>

      <table className="data" data-testid="creator-budget-lines">
        <tbody>
          {preview.lines.map((l) => (
            <tr key={l.key} data-testid={`creator-budget-${l.key}`}>
              <td>{l.label}</td>
              <td className="num mono">{l.cost.toFixed(1)}</td>
            </tr>
          ))}
          <tr>
            <td>
              <strong>Remaining</strong>
            </td>
            <td className="num mono">
              <strong className={over ? 'neg' : 'pos'} data-testid="creator-budget-remaining">
                {preview.remaining.toFixed(1)}
              </strong>
            </td>
          </tr>
        </tbody>
      </table>

      {over ? (
        <div className="errbox" role="alert" data-testid="creator-over-budget">
          Over budget by {(-preview.remaining).toFixed(1)}. Potential, work ethic, skill emphasis and a
          secondary discipline all draw on one fixed pool of {preview.budget} — you cannot max
          everything. Lower one to submit.
        </div>
      ) : (
        <p className="hint" style={{ fontSize: 11 }}>
          Potential, work ethic, skill emphasis and a secondary discipline share one fixed pool. There
          is no free superstar — spending on one leaves less for the others.
        </p>
      )}
    </div>
  )
}
