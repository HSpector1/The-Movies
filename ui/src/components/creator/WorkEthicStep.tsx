// ── Work Ethic step (D-9.11 / D-9.14) ────────────────────────────────────────
// Work Ethic is a visible 1..99 number with a label band. It affects ONLY how the
// talent DEVELOPS (how consistently they turn work into growth, and whether they can
// exceed the studio's visible estimate — never the true ceiling). It does NOT affect
// current OVR, Fit, star power, box office, or critic score. Higher WE costs more
// budget (linear: AUTHORED_WE_COST · WE/99).

import { workEthicLabel } from '../../engine/adapter.ts'

export function WorkEthicStep({
  workEthic,
  weCost,
  onChange,
}: {
  workEthic: number
  weCost: number // this WE's current budget cost, for inline display
  onChange: (v: number) => void
}) {
  return (
    <div className="card stack">
      <h2>Work Ethic</h2>
      <p className="hint">
        How consistently they turn work into growth. Work ethic affects <strong>only development</strong>{' '}
        — never their current ability, Fit, star power, or immediate quality. A driven talent develops
        faster and can outgrow the studio&apos;s estimate; it never lets anyone exceed their true ceiling.
        Higher work ethic costs more budget.
      </p>
      <div className="spread">
        <label htmlFor="talent-workethic">Work ethic</label>
        <span className="mono">
          <strong data-testid="creator-we-value">{workEthic}</strong> ·{' '}
          <span data-testid="creator-we-label">{workEthicLabel(workEthic)}</span>{' '}
          <span className="badge" data-testid="creator-we-cost">
            {weCost.toFixed(1)} budget
          </span>
        </span>
      </div>
      <input
        id="talent-workethic"
        type="range"
        min={1}
        max={99}
        step={1}
        value={workEthic}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid="talent-workethic"
      />
      <div className="spread hint">
        <span>1 · Poor</span>
        <span>99 · Relentless</span>
      </div>
    </div>
  )
}
