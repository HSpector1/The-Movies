// ── Potential tier step (D-9.10 / D-9.14) ────────────────────────────────────
// The player picks a POTENTIAL TIER — a hidden ceiling, shown ONLY as a tier label +
// an approximate ceiling-OVR band. It is NOT current ability: authored talent start
// LOW and grow toward this ceiling through development + work ethic. The band is an
// estimate the studio itself is a little uncertain about (the true ceiling is jittered
// within or slightly outside it). Each tier costs budget (higher ceiling ⇒ costlier);
// GenerationalUpside is authored-only and the most expensive.

import type { PotentialTier, AuthoredTierInfo } from '../../engine/adapter.ts'
import { authoredTierTable } from '../../engine/adapter.ts'

export function PotentialStep({
  tier,
  onChange,
}: {
  tier: PotentialTier
  onChange: (t: PotentialTier) => void
}) {
  const tiers: AuthoredTierInfo[] = authoredTierTable()
  return (
    <div className="card stack">
      <h2>Potential</h2>
      <p className="hint">
        Potential is a <strong>hidden ceiling</strong> — the most they could ever become, shown only as
        a tier and an approximate band. It is <strong>not</strong> their current ability. They start low
        and grow toward it through development and work ethic. Even the studio is a little uncertain: the
        true ceiling may land inside or slightly outside the band. Higher ceilings cost more budget.
      </p>
      <div className="grid grid-2" data-testid="creator-tier-grid">
        {tiers.map((t) => (
          <button
            key={t.tier}
            type="button"
            className={`option stack${t.tier === tier ? ' selected' : ''}`}
            style={{ textAlign: 'left', width: '100%' }}
            onClick={() => onChange(t.tier)}
            data-testid={`creator-tier-${t.tier}`}
          >
            <div className="spread">
              <span className="opt-title">{t.label}</span>
              <span className="badge" data-testid={`creator-tier-cost-${t.tier}`}>
                {t.cost} budget
              </span>
            </div>
            <div className="opt-desc">
              Ceiling estimate{' '}
              <span className="mono" data-testid={`creator-tier-band-${t.tier}`}>
                {t.ceilingLow}–{t.ceilingHigh} OVR
              </span>{' '}
              <span className="tag estimate">hidden / uncertain</span>
            </div>
            <div className="opt-desc hint">{t.band}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
