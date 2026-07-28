// ── ChangePreview — only REAL computed deltas, no fabricated prose ────────────
// PURE display. Given a PackageDelta (the engine's pure diff of two package
// assessments), render each numeric delta it actually computed. Nothing here
// invents a directional claim: every line is backed by a number from `delta`, the
// signed metric deltas use the shared Delta component's pos/neg/zero coloring, and
// the money deltas are formatted with a sign and money pos/neg class. When nothing
// changed (no reassignment and every numeric delta is ~0), it says "No change."

import type { PackageDelta } from '../engine/adapter.ts'
import { money } from '../format.ts'
import { Delta } from './common.tsx'

// A money delta with an explicit sign and pos/neg color (never color alone). Used
// for revenue / profit / salary, which are shown in money units, not points.
function MoneyDelta({ value, testid }: { value: number; testid: string }) {
  const cls = value >= 0 ? 'money pos' : 'money neg'
  const sign = value >= 0 ? '+' : '-'
  return (
    <span className={cls} data-testid={testid}>
      {sign}
      {money(Math.abs(value))}
    </span>
  )
}

// A numeric delta counts as "no change" when it rounds to zero at display precision.
const NEAR_ZERO = 0.5

export function ChangePreview({ delta, label }: { delta: PackageDelta; label?: string }) {
  const changedAssignments = delta.perAssignment.filter(
    (a) => a.changed && a.fitBefore !== undefined && a.fitAfter !== undefined,
  )

  const nothingChanged =
    changedAssignments.length === 0 &&
    Math.abs(delta.overallFitDelta) < NEAR_ZERO &&
    Math.abs(delta.executionConfidenceDelta) < NEAR_ZERO &&
    Math.abs(delta.studioRevenueExpectedDelta) < NEAR_ZERO &&
    Math.abs(delta.profitExpectedDelta) < NEAR_ZERO &&
    Math.abs(delta.starPowerDelta) < NEAR_ZERO &&
    Math.abs(delta.salaryDelta) < NEAR_ZERO

  return (
    <div className="panel" data-testid="change-preview">
      <div className="spread">
        <h4 style={{ margin: 0 }}>{label ?? 'Change preview'}</h4>
      </div>

      {nothingChanged ? (
        <p className="hint">No change.</p>
      ) : (
        <>
          {changedAssignments.length > 0 && (
            <div className="stack" style={{ marginTop: 8 }}>
              {changedAssignments.map((a) => (
                <div
                  className="spread"
                  key={`${a.role}${a.slot ? `-${a.slot}` : ''}`}
                  data-testid={`change-assignment-${a.role}${a.slot ? `-${a.slot}` : ''}`}
                >
                  <span>
                    {a.role}
                    {a.slot ? ` ${a.slot}` : ''} Fit {Math.round(a.fitBefore!)}→{Math.round(a.fitAfter!)}
                  </span>
                  <Delta value={a.fitDelta ?? 0} digits={0} />
                </div>
              ))}
            </div>
          )}

          <div className="sep" />

          <div className="stack">
            <div className="spread">
              <span>Overall Talent Fit</span>
              <Delta value={delta.overallFitDelta} digits={0} testid="change-overall-fit" />
            </div>
            <div className="spread">
              <span>Execution Confidence</span>
              <Delta value={delta.executionConfidenceDelta} digits={0} testid="change-exec" />
            </div>
            <div className="spread">
              <span>Studio Revenue (expected)</span>
              <MoneyDelta value={delta.studioRevenueExpectedDelta} testid="change-revenue" />
            </div>
            <div className="spread">
              <span>Profit (expected)</span>
              <MoneyDelta value={delta.profitExpectedDelta} testid="change-profit" />
            </div>
            <div className="spread">
              <span>Star Power</span>
              <Delta value={delta.starPowerDelta} digits={0} testid="change-starpower" />
            </div>
            <div className="spread">
              <span>Committed cost (salary + budget)</span>
              <MoneyDelta value={delta.salaryDelta} testid="change-salary" />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
