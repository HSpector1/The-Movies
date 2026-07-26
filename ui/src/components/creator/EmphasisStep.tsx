// ── Skill emphasis + secondary discipline step (D-9.14) ──────────────────────
// Two OPTIONAL, budgeted choices that configure REAL attributes with tradeoffs — no
// unexplained bonuses:
//   • Skill emphasis (specialist ↔ generalist): a magnitude 0..1 over the PRIMARY
//     discipline. A sharper specialist spikes ONE chosen skill and SAGS the rest
//     (the engine's construction), so the STARTING OVR actually drops a little — you
//     trade breadth for a peak. Costs AUTHORED_BIAS_COST · magnitude.
//   • Secondary discipline: a genuinely-usable second discipline, seeded lower than
//     the primary (a real tradeoff, not a free extra). Flat AUTHORED_SECONDARY_COST.
// Both show their live budget cost; either can be left off (cost 0).

import type { CreativeRole, Discipline } from '../../engine/adapter.ts'
import { AUTHORED_SKILL_LABELS, DISCIPLINE_LABEL, primaryDiscipline } from '../../engine/adapter.ts'

// The three disciplines a secondary may be (anything but the primary), presented as
// the CreativeRole the player picks (role → discipline in the engine).
const ROLE_FOR_DISCIPLINE: Record<Discipline, CreativeRole> = {
  acting: 'actor',
  writing: 'writer',
  directing: 'director',
  craft: 'craft',
}

export function EmphasisStep({
  role,
  biasEnabled,
  biasSkillIndex,
  biasMagnitude,
  biasCost,
  secondaryRole,
  secondaryCost,
  onToggleBias,
  onBiasSkillIndex,
  onBiasMagnitude,
  onSecondary,
}: {
  role: CreativeRole
  biasEnabled: boolean
  biasSkillIndex: number
  biasMagnitude: number
  biasCost: number
  secondaryRole: CreativeRole | null
  secondaryCost: number
  onToggleBias: (on: boolean) => void
  onBiasSkillIndex: (i: number) => void
  onBiasMagnitude: (m: number) => void
  onSecondary: (r: CreativeRole | null) => void
}) {
  const primary = primaryDiscipline(role)
  const skillLabels = AUTHORED_SKILL_LABELS[primary]
  // Secondary options: every discipline except the primary.
  const secondaryOptions: Discipline[] = (['acting', 'writing', 'directing', 'craft'] as Discipline[]).filter(
    (d) => d !== primary,
  )

  return (
    <div className="card stack">
      <h2>Skill emphasis &amp; secondary discipline</h2>
      <p className="hint">
        Both are optional and budgeted. They set real attributes with real tradeoffs — there are no free
        bonuses here.
      </p>

      {/* Specialist ↔ generalist bias over the primary discipline. */}
      <div className="fact-block stack" data-testid="creator-bias-block">
        <div className="spread">
          <strong>Skill emphasis ({DISCIPLINE_LABEL[primary]})</strong>
          <label className="row" style={{ gap: 6 }}>
            <input
              type="checkbox"
              checked={biasEnabled}
              onChange={(e) => onToggleBias(e.target.checked)}
              data-testid="creator-bias-toggle"
            />
            <span className="hint">Specialise</span>
          </label>
        </div>
        <p className="hint" style={{ fontSize: 11 }}>
          A specialist spikes one skill and lowers the others — a peak with real weaknesses. This LOWERS
          the starting OVR slightly (you trade breadth for a peak) and raises that skill&apos;s ceiling.
          A generalist (emphasis off) is even across the discipline.
        </p>

        {biasEnabled && (
          <>
            <label htmlFor="creator-bias-skill">Skill to spike</label>
            <select
              id="creator-bias-skill"
              value={biasSkillIndex}
              onChange={(e) => onBiasSkillIndex(Number(e.target.value))}
              data-testid="creator-bias-skill"
            >
              {skillLabels.map((label, i) => (
                <option key={label} value={i}>
                  {label}
                </option>
              ))}
            </select>

            <div className="spread">
              <label htmlFor="creator-bias-mag">
                Sharpness: <strong className="mono">{biasMagnitude.toFixed(2)}</strong>
              </label>
              <span className="badge" data-testid="creator-bias-cost">
                {biasCost.toFixed(1)} budget
              </span>
            </div>
            <input
              id="creator-bias-mag"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={biasMagnitude}
              onChange={(e) => onBiasMagnitude(Number(e.target.value))}
              data-testid="creator-bias-mag"
            />
            <div className="spread hint">
              <span>Generalist</span>
              <span>Sharp specialist</span>
            </div>
          </>
        )}
      </div>

      {/* Optional secondary discipline. */}
      <div className="fact-block stack" data-testid="creator-secondary-block">
        <div className="spread">
          <strong>Secondary discipline</strong>
          <span className="badge" data-testid="creator-secondary-cost">
            {secondaryCost.toFixed(1)} budget
          </span>
        </div>
        <p className="hint" style={{ fontSize: 11 }}>
          A genuinely-usable second discipline, seeded below the primary — a real tradeoff, not a free
          extra. Optional.
        </p>
        <div className="btn-row" data-testid="creator-secondary-row" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`option${secondaryRole === null ? ' selected' : ''}`}
            style={{ width: 'auto' }}
            onClick={() => onSecondary(null)}
            data-testid="creator-secondary-none"
          >
            None
          </button>
          {secondaryOptions.map((d) => {
            const r = ROLE_FOR_DISCIPLINE[d]
            return (
              <button
                key={d}
                type="button"
                className={`option${secondaryRole === r ? ' selected' : ''}`}
                style={{ width: 'auto' }}
                onClick={() => onSecondary(r)}
                data-testid={`creator-secondary-${d}`}
              >
                {DISCIPLINE_LABEL[d]}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
