// ── TalentPicker ─────────────────────────────────────────────────────────────
// Choose one talent for a role (writer / director / a cast slot). Shows ONLY
// player-visible fields (perceived persona, known skill, fame, salary,
// availability). Ineligible talent is disabled with a plain-English reason
// (mirrors the engine's applyActions legality via the adapter's eligibility rules).

import type { PlayerVisibleTalent, CreativeRole } from '../engine/adapter.ts'
import { talentEligibility } from '../engine/adapter.ts'
import { money, axis } from '../format.ts'

export function TalentPicker({
  title,
  pool,
  role,
  selectedId,
  chosenElsewhere,
  onSelect,
  testid,
}: {
  title: string
  pool: PlayerVisibleTalent[]
  role: CreativeRole
  selectedId: string | null
  chosenElsewhere: string[]
  onSelect: (id: string) => void
  testid?: string
}) {
  return (
    <div className="stack" {...(testid ? { 'data-testid': testid } : {})}>
      <h4>{title}</h4>
      <div className="scroll stack">
        {pool.map((t) => {
          const elig = talentEligibility(t, role, chosenElsewhere)
          const selected = selectedId === t.id
          return (
            <button
              type="button"
              key={t.id}
              className={`option${selected ? ' selected' : ''}${elig.eligible ? '' : ' ineligible'}`}
              disabled={!elig.eligible}
              onClick={() => onSelect(t.id)}
              data-testid={`talent-${t.id}`}
              aria-pressed={selected}
            >
              <div className="spread">
                <span className="opt-title">
                  {t.name}
                  {t.authored && (
                    <span className="badge authored" style={{ marginLeft: 8 }}>
                      Authored
                    </span>
                  )}
                </span>
                <span className="badge">Fame {t.fame.toFixed(0)}</span>
              </div>
              <div className="opt-desc">
                Known ability {t.skill.toFixed(0)} · Salary {money(t.salary)} · Age {t.age.toFixed(0)}
              </div>
              <div className="opt-desc">
                Believed to be — warmth {axis(t.perceived.warmth)}, gravity{' '}
                {axis(t.perceived.gravity)}, physicality {axis(t.perceived.physicality)}
              </div>
              {!elig.eligible && <div className="reason">{elig.reason}</div>}
            </button>
          )
        })}
      </div>
    </div>
  )
}
