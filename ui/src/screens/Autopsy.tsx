// ── Autopsy — the key explanation screen ─────────────────────────────────────
// Every number here is an engine value (reconstructed via the adapter's
// explainRelease → public resolveReception). Nothing is invented. The random term
// (reviewVariance) is NEVER hidden. The film is presented as an authored object,
// not one number: craft, cohesion, per-contributor vectors, shape effects, promise
// alignment, timing, reach, the full critic breakdown, per-segment response, the
// box-office breakdown, profit/loss, standing deltas and WHY each channel moved.

import { useState } from 'react'
import type { AutopsyView, AutopsyCompareView, FilmParticipant, FilmParticipants } from '../engine/adapter.ts'
import { accessibleAutopsy } from '../engine/adapter.ts'
import { money, moneyExact, score, axis, signed, segmentLabel, factorLabel } from '../format.ts'
import { Metric, Delta } from '../components/common.tsx'

function Vec({ v }: { v: { intimacy: number; tonalWeight: number; kineticEnergy: number } }) {
  return (
    <span className="mono">
      ({axis(v.intimacy)}, {axis(v.tonalWeight)}, {axis(v.kineticEnergy)})
    </span>
  )
}

// D-11.A — the film's OWN immutable participants, in a fixed role order. Rendered from
// the frozen record captured at THIS film's greenlight; never current roster/other films.
const PART_ROLE_LABEL: Record<FilmParticipant['role'], string> = {
  writer: 'Writer',
  director: 'Director',
  lead: 'Lead',
  antagonist: 'Antagonist',
  support: 'Support',
  craft: 'Production/Craft Lead',
}
function flattenParticipants(p: FilmParticipants): FilmParticipant[] {
  return [p.writer, p.director, p.cast.lead, p.cast.antagonist, p.cast.support, ...p.craft]
}
function ParticipantsCard({ participants }: { participants: FilmParticipants }) {
  const rows = flattenParticipants(participants)
  return (
    <div className="card" data-testid="autopsy-participants">
      <h2>Who made this film</h2>
      <p className="hint">
        The cast and crew as greenlit — this film&rsquo;s own frozen record. Later changes to
        these people never rewrite it.
      </p>
      <table className="data">
        <thead>
          <tr>
            <th>Role</th>
            <th>Name</th>
            <th>Employment</th>
            <th className="num">Greenlight OVR</th>
            <th className="num">Fit</th>
            <th className="num">Expected</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={`${r.role}-${r.talentId}`} data-testid={`autopsy-participant-${r.talentId}`}>
              <td>{PART_ROLE_LABEL[r.role]}</td>
              <td data-testid={`autopsy-participant-name-${r.role}`}>{r.name}</td>
              <td>{r.freelancer ? 'Freelancer' : 'Studio'}</td>
              <td className="num">{r.greenlightOVR}</td>
              <td className="num">{r.greenlightFit}</td>
              <td className="num">
                {r.greenlightEP.low.toFixed(0)}–{r.greenlightEP.high.toFixed(0)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Autopsy({
  view,
  compare,
  onBack,
}: {
  view: AutopsyView
  compare: AutopsyCompareView | null
  onBack: () => void
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const simple = accessibleAutopsy(view, compare)
  const profitPositive = view.profit >= 0
  return (
    <div className="app-shell" data-testid="autopsy">
      <div className="topbar">
        <div className="brand">
          <span className="mark">AUTOPSY</span>
          <span className="sub">{view.conceptTitle}</span>
        </div>
        <button className="primary" onClick={onBack} data-testid="autopsy-back">
          Back to studio
        </button>
      </div>

      {/* ── ACCESSIBLE DEFAULT (D-11.D): a concise, plain-language result. Every line is
          synthesized from stored mechanics (adapter.accessibleAutopsy); the full technical
          report is preserved below under Advanced Analysis. ── */}
      <div className="card stack" data-testid="autopsy-summary">
        <div className="spread">
          <h2 style={{ margin: 0 }}>The result</h2>
          <span className="badge" data-testid="autopsy-grade">
            {simple.grade}
          </span>
        </div>
        <div className="grid grid-4" style={{ marginTop: 8 }}>
          <Metric label="Critics" small testid="autopsy-result-critic">
            {simple.criticStars.toFixed(1)}/5 · {Math.round(simple.criticScore)}/100
          </Metric>
          <Metric label="Audience" small testid="autopsy-result-audience">
            {simple.audienceLabel}
          </Metric>
          <Metric label="Revenue" small testid="autopsy-result-revenue">
            {money(simple.revenue)}
          </Metric>
          <Metric label="Profit / loss" small testid="autopsy-result-profit">
            <span className={simple.profitable ? 'money pos' : 'money neg'}>
              {simple.profitable ? 'Profit ' : 'Loss '}
              {moneyExact(simple.profit)}
            </span>
          </Metric>
        </div>
        <span className="hint" data-testid="autopsy-result-forecast">
          Forecast at greenlight: {score(simple.expectedCritic)} critic · {money(simple.expectedTotal)}{' '}
          total. Studio Revenue is the full box-office total (no distributor split in the current model).
        </span>
      </div>

      <div style={{ height: 16 }} />

      <div className="grid grid-2">
        <div className="card stack" data-testid="autopsy-worked">
          <h3 style={{ marginTop: 0 }}>What worked</h3>
          {simple.whatWorked.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {simple.whatWorked.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="hint">Nothing stood out as a clear strength.</p>
          )}
        </div>
        <div className="card stack" data-testid="autopsy-hurt">
          <h3 style={{ marginTop: 0 }}>What hurt</h3>
          {simple.whatHurt.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              {simple.whatHurt.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="hint">Nothing went badly wrong.</p>
          )}
        </div>
      </div>

      <div style={{ height: 16 }} />

      <div className="grid grid-2">
        <div className="card stack" data-testid="autopsy-surprise">
          <h3 style={{ marginTop: 0 }}>Biggest surprise</h3>
          <p style={{ margin: 0 }}>{simple.biggestSurprise}</p>
        </div>
        <div className="card stack" data-testid="autopsy-lessons">
          <h3 style={{ marginTop: 0 }}>What the studio learned</h3>
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            {simple.lessons.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* D-11.A — this film's OWN immutable cast & crew (frozen at greenlight). Kept in the
          accessible view: this is identity, not deep math. */}
      {view.participants && <ParticipantsCard participants={view.participants} />}

      {view.participants && <div style={{ height: 16 }} />}

      {/* ── Advanced Analysis (D-11.D): the full technical report, collapsed by default but
          always MOUNTED (preserved verbatim), so nothing is lost. ── */}
      <div className="card stack">
        <button
          type="button"
          className="ghost spread"
          style={{ width: '100%' }}
          onClick={() => setAdvancedOpen((o) => !o)}
          data-testid="autopsy-advanced-toggle"
        >
          <strong>Advanced Analysis</strong>
          <span className="mono">{advancedOpen ? 'Hide −' : 'Show +'}</span>
        </button>
        <p className="hint" style={{ marginBottom: 0 }}>
          The full technical breakdown — the locked greenlight assessment, craft, cohesion vectors,
          critic construction (including the sampled variance), per-segment response, the box-office
          build, and standing changes. Every number the summary above is built from.
        </p>
      </div>

      <div hidden={!advancedOpen} data-testid="autopsy-advanced">
        <div style={{ height: 16 }} />

        {/* Headline: forecast (estimate) vs result */}
        <div className="card">
        <div className="spread">
          <h2 style={{ margin: 0 }}>What we expected, and what happened</h2>
        </div>
        <div className="grid grid-3" style={{ marginTop: 12 }}>
          <div className="estimate-block">
            <Metric label="Forecast critic (estimate)" small>
              {score(view.forecast.expectedCriticScore)}
            </Metric>
            <Metric label="Forecast total (estimate)" small>
              {money(view.forecast.expectedTotal)}
            </Metric>
          </div>
          <div className="result-block">
            <Metric label="Realized critic (result)" small testid="autopsy-critic">
              {score(view.criticScore)}
            </Metric>
            <Metric label="Realized total (result)" small>
              {money(view.boxOffice.total)}
            </Metric>
          </div>
          <div>
            <Metric label="Profit / loss (result)" small testid="autopsy-profit">
              <span className={profitPositive ? 'money pos' : 'money neg'}>
                {profitPositive ? 'Profit ' : 'Loss '}
                {moneyExact(view.profit)}
              </span>
            </Metric>
            <Metric label="Committed cost" small>
              {moneyExact(view.committedCost)}
            </Metric>
          </div>
        </div>
      </div>

        <div style={{ height: 16 }} />

        {/* Greenlight expectation vs actual — the locked decision, graded against reality */}
        {compare && <GreenlightCompare compare={compare} view={view} />}

      <div className="grid grid-2">
        {/* Craft breakdown */}
        <div className="card">
          <h3>Craft</h3>
          <p className="hint">How well the film was made — script, direction, cast, technical, budget.</p>
          <table className="data">
            <tbody>
              <tr>
                <td>Script strength</td>
                <td className="num">{score(view.scriptStrength)}</td>
              </tr>
              <tr>
                <td>Director execution</td>
                <td className="num">{score(view.directorExecution)}</td>
              </tr>
              <tr>
                <td>Cast execution</td>
                <td className="num">{score(view.castExecution)}</td>
              </tr>
              <tr>
                <td>Technical</td>
                <td className="num">{score(view.technical)}</td>
              </tr>
              <tr>
                <td>Budget adequacy</td>
                <td className="num">{score(view.budgetAdequacy)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Craft</strong>
                </td>
                <td className="num">
                  <strong>{score(view.craft)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p className="hint">Required negative: {money(view.requiredNegative)}</p>
        </div>

        {/* Cohesion + contributions */}
        <div className="card">
          <h3>Cohesion</h3>
          <p className="hint">
            Does the film feel intentional? Each contributor pulls the film in a direction; cohesion
            measures how aligned they are.
          </p>
          <table className="data">
            <thead>
              <tr>
                <th>Contributor</th>
                <th className="num">Vector (intimacy, weight, energy)</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(view.contributions).map(([key, c]) => (
                <tr key={key}>
                  <td>{c.role}</td>
                  <td className="num">
                    <Vec v={c.vector} />
                  </td>
                </tr>
              ))}
              <tr>
                <td>
                  <strong>Delivered (centroid)</strong>
                </td>
                <td className="num">
                  <strong>
                    <Vec v={view.delivered} />
                  </strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="row" style={{ gap: 24, marginTop: 8 }}>
            <Metric label="Directional agreement" small>
              {score(view.directionalAgreement, 2)}
            </Metric>
            <Metric label="Expressive strength" small>
              {score(view.expressiveStrength, 2)}
            </Metric>
            <Metric label="Cohesion" small testid="autopsy-cohesion">
              {score(view.cohesion, 2)}
            </Metric>
          </div>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Critic breakdown — including the sampled term, never hidden */}
      <div className="card">
        <h3>Critical reception</h3>
        <p className="hint">
          The critic score is drawn around a mean; the sampled variance is part of the outcome and is
          shown here, never hidden.
        </p>
        <div className="grid grid-4">
          <Metric label="0.65 × craft" small>
            {score(0.65 * view.craft)}
          </Metric>
          <Metric label="Cohesion contribution" small>
            {signed(view.cohesionContribution)}
          </Metric>
          <Metric label="Originality contribution" small>
            {signed(view.originalityContribution)}
          </Metric>
          <Metric label="Timeliness contribution" small>
            {signed(view.timelinessContribution)}
          </Metric>
        </div>
        <div className="sep" />
        <div className="grid grid-4">
          <Metric label="Critic mean" small testid="autopsy-criticmean">
            {score(view.criticMean)}
          </Metric>
          <Metric label="Critic sigma" small>
            {score(view.criticSigma, 2)}
          </Metric>
          <Metric label="Review variance (sampled)" small testid="autopsy-reviewvariance">
            <span className="tag estimate" style={{ marginRight: 6 }}>
              Random
            </span>
            {signed(view.reviewVariance)}
          </Metric>
          <Metric label="Realized critic score" small>
            {score(view.criticScore)}
          </Metric>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Force alignment (cultural timing): {axis(view.forceAlignment)} · Originality (raw):{' '}
          {score(view.originalityRaw)}
        </p>
      </div>

      <div style={{ height: 16 }} />

      <div className="grid grid-2">
        {/* Promise + segment appeal */}
        <div className="card">
          <h3>Promise &amp; audience</h3>
          <p className="hint">
            How well the delivered film matched the promise, and how each segment responded.
          </p>
          <div className="row" style={{ gap: 24 }}>
            <Metric label="Promise mismatch" small testid="autopsy-mismatch">
              {score(view.promiseMismatch, 2)}
            </Metric>
            <Metric label="Mismatch penalty" small>
              {score(view.mismatchPenalty)}
            </Metric>
            <Metric label="Star draw" small>
              {score(view.starDraw)}
            </Metric>
          </div>
          <div className="sep" />
          <table className="data">
            <thead>
              <tr>
                <th>Segment</th>
                <th className="num">Fit</th>
                <th className="num">Appeal</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(view.segmentAppeal).map((seg) => (
                <tr key={seg}>
                  <td>{segmentLabel(seg)}</td>
                  <td className="num">{score(view.segmentFit[seg as keyof typeof view.segmentFit])}</td>
                  <td className="num">{score(view.segmentAppeal[seg as keyof typeof view.segmentAppeal])}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Box office breakdown */}
        <div className="card">
          <h3>Box office</h3>
          <table className="data">
            <tbody>
              <tr>
                <td>Awareness factor (reach)</td>
                <td className="num">{score(view.awarenessFactor, 2)}</td>
              </tr>
              <tr>
                <td>Opening reach multiplier</td>
                <td className="num">{score(view.openingReachMult, 2)}</td>
              </tr>
              <tr>
                <td>Weighted audience score</td>
                <td className="num">{score(view.weightedAudienceScore)}</td>
              </tr>
              <tr>
                <td>Legs</td>
                <td className="num">{score(view.legs, 2)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Opening</strong>
                </td>
                <td className="num">
                  <strong>{money(view.boxOffice.opening)}</strong>
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Total</strong>
                </td>
                <td className="num">
                  <strong>{money(view.boxOffice.total)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ height: 16 }} />

      {/* Standing deltas + WHY each channel moved (D-6 inputs) */}
      <div className="card">
        <h3>Standing changes — and why</h3>
        <div className="grid grid-3">
          <div className="stack">
            <div className="spread">
              <strong>Audience Awareness</strong>
              <Delta value={view.standingDeltas.audienceAwareness} testid="autopsy-delta-aware" />
            </div>
            <span className="hint">{view.standingWhy.awareness}</span>
            <span className="hint mono">
              {view.standingBefore.audienceAwareness.toFixed(0)} →{' '}
              {view.standingAfter.audienceAwareness.toFixed(0)}
            </span>
          </div>
          <div className="stack">
            <div className="spread">
              <strong>Industry Prestige</strong>
              <Delta value={view.standingDeltas.industryPrestige} testid="autopsy-delta-prestige" />
            </div>
            <span className="hint">{view.standingWhy.prestige}</span>
            <span className="hint mono">
              {view.standingBefore.industryPrestige.toFixed(0)} →{' '}
              {view.standingAfter.industryPrestige.toFixed(0)}
            </span>
          </div>
          <div className="stack">
            <div className="spread">
              <strong>Commercial Confidence</strong>
              <Delta
                value={view.standingDeltas.commercialConfidence}
                testid="autopsy-delta-confidence"
              />
            </div>
            <span className="hint">{view.standingWhy.confidence}</span>
            <span className="hint mono">
              {view.standingBefore.commercialConfidence.toFixed(0)} →{' '}
              {view.standingAfter.commercialConfidence.toFixed(0)}
            </span>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

// ── Greenlight expectation vs actual ──────────────────────────────────────────
// The LOCKED greenlight assessment (cohesion, fit-by-assignment, execution confidence,
// commercial forecast, identified strengths & risks) side-by-side with the ACTUAL
// result, plus which identified RISKS materialized (risksMaterialized). Every value is
// an engine output (greenlightAssessment / risksMaterialized via the adapter); no
// unsupported causal prose. This lets the player read distinctions like good-film-bad-
// investment, weak-film-commercial-success, risky-gamble-paid-off, poor-talent-match.
function GreenlightCompare({
  compare,
  view,
}: {
  compare: AutopsyCompareView
  view: AutopsyView
}) {
  const { assessment, risks } = compare
  const expectedProfit = assessment.profit.profit.expected
  const actualProfit = view.profit
  // A plain read of the two axes the decision cared about — derived ONLY from recorded
  // values (cohesion tier expected vs realized cohesion; expected vs actual profit).
  const filmStrong = view.cohesion >= 0.5 || view.criticScore >= 55
  const investmentGood = actualProfit >= 0
  const verdict =
    filmStrong && investmentGood
      ? 'Good film, good investment.'
      : filmStrong && !investmentGood
        ? 'Good film, disappointing investment.'
        : !filmStrong && investmentGood
          ? 'Weak film, commercial success.'
          : 'Weak film, poor investment.'

  return (
    <>
      <div className="card" data-testid="autopsy-greenlight-compare">
        <div className="spread">
          <h2 style={{ margin: 0 }}>The greenlight decision, graded</h2>
          <span className="badge" data-testid="autopsy-verdict">
            {verdict}
          </span>
        </div>
        <p className="hint">
          What the studio committed to at greenlight, and how each judgment held up. These are the
          locked estimates — the film could still have gone the other way.
        </p>

        <div className="grid grid-2" style={{ marginTop: 12 }}>
          {/* Commercial: expected forecast vs actual */}
          <div className="panel stack">
            <h4 style={{ margin: 0 }}>Commercial outlook vs result</h4>
            <div className="spread">
              <span>Expected studio revenue</span>
              <span className="mono" data-testid="autopsy-expected-revenue">
                {money(assessment.profit.studioRevenue.expected)}
              </span>
            </div>
            <div className="spread">
              <span>Actual studio revenue</span>
              <span className="mono">{money(view.boxOffice.total)}</span>
            </div>
            <div className="spread">
              <span>Expected profit / loss</span>
              <span className={`mono ${expectedProfit >= 0 ? 'money pos' : 'money neg'}`}>
                {moneyExact(expectedProfit)}
              </span>
            </div>
            <div className="spread">
              <span>Actual profit / loss</span>
              <span
                className={`mono ${actualProfit >= 0 ? 'money pos' : 'money neg'}`}
                data-testid="autopsy-actual-profit"
              >
                {moneyExact(actualProfit)}
              </span>
            </div>
            <span className="hint">
              Forecast range at greenlight:{' '}
              {money(assessment.profit.profit.low)}–{money(assessment.profit.profit.high)}. Studio
              Revenue is the full box-office total (no distributor split in the model).
            </span>
          </div>

          {/* Perceived judgment vs realized */}
          <div className="panel stack">
            <h4 style={{ margin: 0 }}>Perceived judgment vs realized</h4>
            <div className="spread">
              <span>Creative cohesion (expected)</span>
              <span className="mono">
                {Math.round(assessment.cohesion.score)} ({assessment.cohesion.tier})
              </span>
            </div>
            <div className="spread">
              <span>Cohesion (realized)</span>
              <span className="mono" data-testid="autopsy-realized-cohesion">
                {score(view.cohesion, 2)}
              </span>
            </div>
            <div className="spread">
              <span>Execution confidence (expected)</span>
              <span className="mono">
                {assessment.execution.tier} ({Math.round(assessment.execution.score)})
              </span>
            </div>
            <div className="spread">
              <span>Overall talent Fit (expected)</span>
              <span className="mono">{Math.round(assessment.fit.overall)}</span>
            </div>
            <span className="hint">
              Execution confidence was a PERCEIVED estimate from greenlight-time information — never
              a guarantee of the film's quality.
            </span>
          </div>
        </div>

        {/* Fit-by-assignment (expected) vs actual segment/critic outcome */}
        <div className="sep" />
        <h4>Expected Fit by assignment (locked at greenlight)</h4>
        <table className="data" data-testid="autopsy-fit-by-assignment">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Who</th>
              <th className="num">Fit</th>
              <th className="num">Expected perf.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {assessment.fit.perAssignment.map((a) => (
              <tr key={`${a.role}-${a.slot ?? ''}`} data-testid={`autopsy-fit-${a.role}${a.slot ? '-' + a.slot : ''}`}>
                <td>
                  {a.role}
                  {a.slot ? ` (${a.slot})` : ''}
                </td>
                <td>{a.talentName}</td>
                <td className="num mono">{a.fit.toFixed(0)}</td>
                <td className="num mono">
                  {a.expected.low.toFixed(0)}–{a.expected.high.toFixed(0)}
                </td>
                <td>
                  {a === assessment.fit.weakest && <span className="tag">weakest link</span>}
                  {a === assessment.fit.strongest && <span className="tag">strongest</span>}
                  {a.unproven && <span className="badge">unproven</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Identified strengths & risks, and which risks materialized */}
        <div className="sep" />
        <div className="grid grid-2">
          <div className="stack">
            <h4 style={{ margin: 0 }}>Identified strengths (at greenlight)</h4>
            {assessment.strengths.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18 }} data-testid="autopsy-identified-strengths">
                {assessment.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            ) : (
              <p className="hint">No standout strengths were identified.</p>
            )}
          </div>
          <div className="stack">
            <div className="spread">
              <h4 style={{ margin: 0 }}>Identified risks — did they bite?</h4>
              <span className="badge" data-testid="autopsy-risks-materialized-count">
                {risks.materializedCount}/{risks.risks.length} materialized
              </span>
            </div>
            {risks.risks.length > 0 ? (
              <ul style={{ margin: 0, paddingLeft: 18 }} data-testid="autopsy-risks">
                {risks.risks.map((r, i) => (
                  <li key={i} data-testid={`autopsy-risk-${r.factor}`}>
                    <span className={r.materialized ? 'money neg' : 'money pos'}>
                      {r.materialized ? 'Materialized' : 'Avoided'}
                    </span>{' '}
                    — {factorLabel(r.factor)}: {r.detail}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="hint" data-testid="autopsy-risks">
                No uncertainty factors were flagged at greenlight.
              </p>
            )}
          </div>
        </div>
      </div>
      <div style={{ height: 16 }} />
    </>
  )
}
