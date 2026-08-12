// ── FilmReadiness — an assembled judgment, NOT a hidden master score ──────────
// PURE display. Takes the four already-computed package dimensions and assembles
// three legible columns from them: what looks strong, what looks risky, and a one-
// line studio judgment. There is NO new master score here — every line is derived
// from a field on one of the four dimensions the caller passed in, and the studio
// judgment is a two-axis label (creative × commercial) read straight off those
// fields. A hint states plainly that this is assembled, not a single hidden number.

import type {
  CreativeCohesion,
  PackageFit,
  ExecutionConfidence,
  ForecastProfitRange,
  CycleFixedCost,
} from '../engine/adapter.ts'

// D-17A/T2: "Expected to profit" used to read the DIRECT-cost expected contribution, so a
// package that clears its own negative and marketing but not the 14 weeks of studio payroll
// and overhead it occupies was listed under "What looks strong". The strength claim now runs
// on the STUDIO-ECONOMIC basis; a package that only clears direct costs is stated as exactly
// that, on the risk side, where it belongs. `fixedCost` is the prospective 14-week studio
// fixed cost (0 when the caller has no burn in scope ⇒ behaviour unchanged).
function strongPoints(
  cohesion: CreativeCohesion,
  fit: PackageFit,
  execution: ExecutionConfidence,
  profit: ForecastProfitRange,
  fixedCost: number,
): string[] {
  const out: string[] = []
  if (cohesion.tier === 'strong') out.push('Coherent creative brief')
  for (const s of cohesion.strengths) out.push(s)
  if (fit.strongest.fit >= 70) {
    out.push(`Strong ${fit.strongest.role} (${fit.strongest.talentName})`)
  }
  for (const s of execution.confidenceSources) out.push(s)
  if (profit.profit.expected - fixedCost > 0) {
    out.push(fixedCost > 0 ? 'Expected to profit after studio fixed costs' : 'Expected to profit')
  }
  return out
}

function riskyPoints(
  cohesion: CreativeCohesion,
  fit: PackageFit,
  execution: ExecutionConfidence,
  profit: ForecastProfitRange,
  fixedCost: number,
): string[] {
  const out: string[] = []
  for (const c of cohesion.conflicts) out.push(c)
  if (fit.severeMismatch !== undefined) {
    out.push(`Severe mismatch: ${fit.severeMismatch.role}`)
  } else if (fit.weakest.fit < 45) {
    out.push(`Weak ${fit.weakest.role} (${fit.weakest.talentName})`)
  }
  for (const s of execution.uncertaintySources) out.push(s)
  // Unchanged trigger (D-17A keeps this driven by the direct-cost low band) — the phrasing
  // now names the basis so it cannot be read as the whole picture.
  if (profit.profit.low < 0) {
    out.push(fixedCost > 0 ? 'Could lose money before studio fixed costs' : 'Could lose money')
  }
  // D-17A/T2: the wrong-sign case made explicit — direct costs covered, studio's not.
  if (fixedCost > 0 && profit.profit.expected > 0 && profit.profit.expected - fixedCost < 0) {
    out.push('Central forecast covers direct costs but not the studio weeks it occupies')
  }
  return out
}

// The one-line judgment: creative word (from cohesion.tier) × commercial word. D-17A/T2: the
// commercial word is now read off the STUDIO-ECONOMIC band, so "commercially promising" cannot
// describe a package the studio is expected to lose money on. No new score.
function studioJudgment(
  cohesion: CreativeCohesion,
  profit: ForecastProfitRange,
  fixedCost: number,
): string {
  const creativeWord =
    cohesion.tier === 'strong' ? 'strong' : cohesion.tier === 'mixed' ? 'mixed' : 'weak'
  const expected = profit.profit.expected - fixedCost
  const low = profit.profit.low - fixedCost
  const commercialWord =
    expected > 0 && low >= 0
      ? 'commercially promising'
      : expected > 0
        ? 'commercially promising but uncertain'
        : 'commercially risky'
  return `Creatively ${creativeWord}, ${commercialWord}`
}

export function FilmReadiness({
  cohesion,
  fit,
  execution,
  profit,
  cycleFixedCost,
}: {
  cohesion: CreativeCohesion
  fit: PackageFit
  execution: ExecutionConfidence
  profit: ForecastProfitRange
  // D-17A/T2: the prospective 14-week studio fixed cost. Absent ⇒ unchanged behaviour.
  cycleFixedCost?: CycleFixedCost
}) {
  const fixedCost = cycleFixedCost?.amount ?? 0
  const strong = strongPoints(cohesion, fit, execution, profit, fixedCost)
  const risky = riskyPoints(cohesion, fit, execution, profit, fixedCost)
  const judgment = studioJudgment(cohesion, profit, fixedCost)

  return (
    <div className="card" data-testid="film-readiness">
      <div className="spread">
        <h3 style={{ margin: 0 }}>Readiness</h3>
      </div>

      <div className="grid grid-3" style={{ marginTop: 8 }}>
        <div className="stack" data-testid="readiness-strong">
          <span className="opt-title">What looks strong</span>
          {strong.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {strong.map((s, i) => (
                <li key={`${s}-${i}`}>{s}</li>
              ))}
            </ul>
          ) : (
            <span className="hint">Nothing stands out as a clear strength yet.</span>
          )}
        </div>

        <div className="stack" data-testid="readiness-risky">
          <span className="opt-title">What looks risky</span>
          {risky.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {risky.map((s, i) => (
                <li key={`${s}-${i}`}>{s}</li>
              ))}
            </ul>
          ) : (
            <span className="hint">No major risks identified.</span>
          )}
        </div>

        <div className="stack" data-testid="readiness-judgment">
          <span className="opt-title">Current studio judgment</span>
          <strong>{judgment}</strong>
        </div>
      </div>

      <p className="hint" style={{ marginTop: 8 }}>
        Assembled from the four package dimensions (cohesion, talent fit, execution
        confidence, commercial outlook) — not a single hidden score.
      </p>
    </div>
  )
}
