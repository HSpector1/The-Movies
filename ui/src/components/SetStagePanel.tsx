// ── Where this picture will shoot — the package/greenlight set surface ───────
//
// C2a-M2's LEGIBILITY gate (§12-M2): "the package/greenlight surface names the bound
// set and shows quality/novelty/condition/fit with the projected uplift". This panel
// is that surface.
//
// PURE DISPLAY. Every fact arrives as a prop from `packageSetPlan`, which only calls
// the engine; every sentence arrives from `presentation/setVoice.ts`. This component
// computes no set number and writes no player sentence of its own — it decides only
// what is shown beside what.
//
// THE SHAPE IS THE RCT3-DIAGNOSTICS LAW. Each of the four numbers is a row of
// READING · WORTH · WHY · WHAT TO DO. A player who reads one row knows what the
// number is, what it is doing to their film, what caused it, and the single thing
// they could do about it. That last column is the reason the panel exists at all: a
// stat block with no responses in it is an instrument panel, and the Owner asked for
// a studio.
//
// FIT IS ADVISORY. The panel never renders a set fact as a blocker, and when there is
// no set at all it says in the same breath that the greenlight is not stopped.

import type { PackageSetPlanView, SetCandidateView } from '../engine/sets.ts'
import {
  SET_ADVISORY_NOTE,
  SET_SURFACE_TITLE,
  SET_WAIT_NOTE,
  conditionWord,
  craftPoints,
  noveltyMultiplier,
  percentOfOne,
  plannedSetDisclosure,
  setBlockCopy,
  setDriverLines,
  setIdentityLine,
  setStatusWord,
  setUpliftHeadline,
  upliftShare,
} from '../presentation/setVoice.ts'
import { score } from '../format.ts'

/** One alternative set, told plainly: what it is, and what it would be worth. */
function AlternativeRow({ set, testid }: { set: SetCandidateView; testid: string }) {
  return (
    <tr data-testid={testid}>
      <td>{set.name}</td>
      <td>{set.locationLabel}</td>
      <td>{set.stageName}</td>
      <td className="num mono">{score(set.quality, 0)}</td>
      <td className="num mono">{percentOfOne(set.fit)}</td>
      <td className="num mono">{score(set.condition, 0)}</td>
      <td className="num mono">{craftPoints(set.upliftPoints)}</td>
      <td>{setStatusWord(set)}</td>
    </tr>
  )
}

function AlternativesTable({
  caption,
  sets,
  testid,
}: {
  caption: string
  sets: SetCandidateView[]
  testid: string
}) {
  if (sets.length === 0) return null
  return (
    <div className="stack" data-testid={testid} style={{ marginTop: 8 }}>
      <span className="opt-title">{caption}</span>
      <table className="data">
        <thead>
          <tr>
            <th>Set</th>
            <th>Location</th>
            <th>Stage</th>
            <th className="num">Quality</th>
            <th className="num">Suits it</th>
            <th className="num">Condition</th>
            <th className="num">Craft</th>
            <th>State</th>
          </tr>
        </thead>
        <tbody>
          {sets.map((set) => (
            <AlternativeRow key={set.setId} set={set} testid={`${testid}-${set.setId}`} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function SetStagePanel({ plan }: { plan: PackageSetPlanView }) {
  // A studio whose pictures are not built on its own sets is told nothing about
  // sets: every sentence below would be false of it (G12).
  if (!plan.required) return null

  const planned = plan.planned
  const others = plan.standing.filter((set) => set.setId !== planned?.setId)

  return (
    <div className="panel stack" data-testid="pkg-set">
      <div className="spread">
        <h3 style={{ margin: 0 }}>{SET_SURFACE_TITLE}</h3>
        {planned !== null && (
          <span className="badge" data-testid="pkg-set-condition-badge">
            {conditionWord(planned.conditionBand)}
          </span>
        )}
      </div>

      {planned === null ? (
        <div className="stack" data-testid="pkg-set-unplanned">
          {plan.block !== null && (
            <>
              <strong data-testid="pkg-set-block-headline">{setBlockCopy(plan.block).headline}</strong>
              <p className="reason" style={{ marginTop: 0 }} data-testid="pkg-set-block-reason">
                {setBlockCopy(plan.block).reason}
              </p>
              <p className="hint" style={{ marginTop: 0 }} data-testid="pkg-set-block-response">
                {setBlockCopy(plan.block).response}
              </p>
            </>
          )}
          <p className="hint" style={{ marginTop: 0 }} data-testid="pkg-set-wait-note">
            {SET_WAIT_NOTE}
          </p>
        </div>
      ) : (
        <div className="stack">
          <strong data-testid="pkg-set-identity">{setIdentityLine(planned)}</strong>
          <p className="hint" style={{ marginTop: 0 }} data-testid="pkg-set-disclosure">
            {plannedSetDisclosure(planned)}
          </p>

          <div className="spread" data-testid="pkg-set-uplift">
            <span className="opt-title">What the set is worth to this picture</span>
            <strong className="mono" data-testid="pkg-set-uplift-value">
              {craftPoints(planned.upliftPoints)} craft · {noveltyMultiplier(planned.noveltyFactor)}{' '}
              opening
            </strong>
          </div>
          <p className="reason" style={{ marginTop: 0 }} data-testid="pkg-set-uplift-headline">
            {setUpliftHeadline(planned, plan.maxUplift)}
          </p>
          <span className="hint" data-testid="pkg-set-uplift-share">
            {percentOfOne(upliftShare(planned.upliftPoints, plan.maxUplift))} of everything a set can
            give.
          </span>

          <div className="sep" />
          <table className="data" data-testid="pkg-set-drivers">
            <thead>
              <tr>
                <th>Reading</th>
                <th className="num">Now</th>
                <th className="num">Worth</th>
                <th>Why</th>
                <th>What you can do</th>
              </tr>
            </thead>
            <tbody>
              {setDriverLines(planned, plan).map((line) => (
                <tr key={line.key} data-testid={`pkg-set-driver-${line.key}`}>
                  <td>{line.label}</td>
                  <td className="num mono">{line.reading}</td>
                  <td className="num mono">{line.effect ?? '—'}</td>
                  <td>{line.driver}</td>
                  <td data-testid={`pkg-set-response-${line.key}`}>{line.response}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="hint" style={{ marginTop: 8 }} data-testid="pkg-set-advisory">
        {SET_ADVISORY_NOTE}
      </p>

      <AlternativesTable
        caption="Other sets standing on the lot"
        sets={others}
        testid="pkg-set-alternatives"
      />
      <AlternativesTable
        caption="Scenery still going up"
        sets={plan.underWork}
        testid="pkg-set-underway"
      />
    </div>
  )
}
