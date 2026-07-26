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
} from '../engine/adapter.ts'

function strongPoints(
  cohesion: CreativeCohesion,
  fit: PackageFit,
  execution: ExecutionConfidence,
  profit: ForecastProfitRange,
): string[] {
  const out: string[] = []
  if (cohesion.tier === 'strong') out.push('Coherent creative brief')
  for (const s of cohesion.strengths) out.push(s)
  if (fit.strongest.fit >= 70) {
    out.push(`Strong ${fit.strongest.role} (${fit.strongest.talentName})`)
  }
  for (const s of execution.confidenceSources) out.push(s)
  if (profit.profit.expected > 0) out.push('Expected to profit')
  return out
}

function riskyPoints(
  cohesion: CreativeCohesion,
  fit: PackageFit,
  execution: ExecutionConfidence,
  profit: ForecastProfitRange,
): string[] {
  const out: string[] = []
  for (const c of cohesion.conflicts) out.push(c)
  if (fit.severeMismatch !== undefined) {
    out.push(`Severe mismatch: ${fit.severeMismatch.role}`)
  } else if (fit.weakest.fit < 45) {
    out.push(`Weak ${fit.weakest.role} (${fit.weakest.talentName})`)
  }
  for (const s of execution.uncertaintySources) out.push(s)
  if (profit.profit.low < 0) out.push('Could lose money')
  return out
}

// The one-line judgment: creative word (from cohesion.tier) × commercial word (from
// the sign of expected profit and whether the low end dips negative). No new score.
function studioJudgment(cohesion: CreativeCohesion, profit: ForecastProfitRange): string {
  const creativeWord =
    cohesion.tier === 'strong' ? 'strong' : cohesion.tier === 'mixed' ? 'mixed' : 'weak'
  const commercialWord =
    profit.profit.expected > 0 && profit.profit.low >= 0
      ? 'commercially promising'
      : profit.profit.expected > 0
        ? 'commercially promising but uncertain'
        : 'commercially risky'
  return `Creatively ${creativeWord}, ${commercialWord}`
}

export function FilmReadiness({
  cohesion,
  fit,
  execution,
  profit,
}: {
  cohesion: CreativeCohesion
  fit: PackageFit
  execution: ExecutionConfidence
  profit: ForecastProfitRange
}) {
  const strong = strongPoints(cohesion, fit, execution, profit)
  const risky = riskyPoints(cohesion, fit, execution, profit)
  const judgment = studioJudgment(cohesion, profit)

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
