// ── D-17A/T4 — affordability scopes, promoted out of the D-15 recap ───────────
// "What can I actually make right now?" at three scopes, from the RECAP's own package
// builders and the ENGINE's own solvency gate (`affordabilityScopes` → `commitmentPreview`
// → `canAfford`). PURE display: every figure is passed in; this component computes nothing.
//
// WHY IT MOVED. These three numbers existed, correct and parity-tested, but were reachable
// only through the Studio Run Recap — a retrospective screen. A player deciding whether to
// greenlight, or wondering why the studio feels stuck, could not see them at the moment the
// question arises. They are now on the Dashboard from the first week of a run (no recap
// gating) and beside the budget picker at Assembly.
//
// The three labels are D-15's own vocabulary, verbatim, so the recap and these surfaces
// cannot describe the same number in two different ways.

import type { AffordabilityScopes, PositionAffordability } from '../engine/adapter.ts'
import { money, moneyExact } from '../format.ts'

// "$X — affordable" / "$X — short $Y" (colour AND text, never colour alone — a11y).
function AffordLine({ a }: { a: PositionAffordability }) {
  return (
    <>
      {moneyExact(a.commitment)} &mdash;{' '}
      {a.affordable ? (
        <span className="money pos">affordable</span>
      ) : (
        <span className="money neg">short {moneyExact(a.shortfall)}</span>
      )}
    </>
  )
}

function ScopeRow({
  label,
  scope,
  testid,
  note,
}: {
  label: string
  scope: PositionAffordability | null
  testid: string
  note?: string | undefined
}) {
  return (
    <div className="stack" style={{ gap: 2 }}>
      <div className="spread">
        <span className="hint">{label}</span>
        <span className="mono" data-testid={testid}>
          {scope ? <AffordLine a={scope} /> : '—'}
        </span>
      </div>
      {note !== undefined && (
        <span className="hint" style={{ fontSize: '0.85em', opacity: 0.8 }}>
          {note}
        </span>
      )}
    </div>
  )
}

export function AffordabilityScopesCard({
  scopes,
  testid = 'affordability-scopes',
}: {
  scopes: AffordabilityScopes
  testid?: string
}) {
  return (
    <div className="stack" data-testid={testid} style={{ gap: 8 }}>
      <ScopeRow
        label="Lowest estimated production commitment"
        scope={scopes.cheapest}
        testid={`${testid}-cheapest`}
        note={
          scopes.cheapestBreakdown
            ? `Production ${money(scopes.cheapestBreakdown.negative)} + minimum marketing ${money(
                scopes.cheapestBreakdown.marketing,
              )}${
                scopes.cheapestBreakdown.freelancerFees > 0
                  ? ` + freelancer fees ${money(scopes.cheapestBreakdown.freelancerFees)}`
                  : ''
              }. Cheapest concept, lowest budget, minimum marketing${
                scopes.contractedRosterCanFieldFilm
                  ? ', current contracted team.'
                  : ', with freelancers to fill roles.'
              }`
            : undefined
        }
      />
      <ScopeRow
        label="A standard-budget film"
        scope={scopes.standard}
        testid={`${testid}-standard`}
        note="The cheapest concept funded at a normal budget & marketing."
      />
      <ScopeRow
        label="Recent typical commitment"
        scope={scopes.recentTypical}
        testid={`${testid}-typical`}
        note="Median production commitment of your last three released films."
      />
      <p className="hint" style={{ margin: 0 }} data-testid={`${testid}-disclosure`}>
        Estimates from your current concepts and contracted team, checked against the same
        solvency rule a greenlight enforces &mdash; not a guaranteed quote.
      </p>
    </div>
  )
}
