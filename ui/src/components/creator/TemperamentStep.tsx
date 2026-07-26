// ── Creative Temperament step (D-9.8) ────────────────────────────────────────
// The player authors WHO the talent naturally is — their expressive nature, NOT
// their ability. Two ways to set it:
//   • Presets — each is a persona triple that sets ONLY temperament (no skill,
//     potential, or work-ethic bonus; costs NO budget).
//   • Manual axes — three sliders (warmth/gravity/physicality ∈ [−1,1]).
// The live temperamentSummary (from the engine) is shown so the player sees exactly
// how their choice reads. Temperament affects Fit, never OVR (enforced in core).

import type { Persona, TemperamentPreset } from '../../engine/adapter.ts'
import { AUTHORED_TEMPERAMENT_PRESETS, temperamentSummary } from '../../engine/adapter.ts'

function AxisSlider({
  id,
  label,
  low,
  high,
  value,
  onChange,
}: {
  id: string
  label: string
  low: string
  high: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="stack">
      <label htmlFor={id}>
        {label}: <strong className="mono">{value.toFixed(2)}</strong>
      </label>
      <input
        id={id}
        type="range"
        min={-1}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={`persona-${id}`}
      />
      <div className="spread hint">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

// Which preset (if any) exactly matches the current persona — so its chip stays lit
// after selection and clears the moment the player hand-tunes an axis.
function matchingPresetKey(persona: Persona): string | null {
  for (const p of AUTHORED_TEMPERAMENT_PRESETS) {
    if (
      p.persona.warmth === persona.warmth &&
      p.persona.gravity === persona.gravity &&
      p.persona.physicality === persona.physicality
    ) {
      return p.key
    }
  }
  return null
}

export function TemperamentStep({
  persona,
  onChange,
}: {
  persona: Persona
  onChange: (p: Persona) => void
}) {
  const activeKey = matchingPresetKey(persona)
  const applyPreset = (p: TemperamentPreset) => onChange({ ...p.persona })

  return (
    <div className="card stack">
      <h2>Creative Temperament</h2>
      <p className="hint">
        You author who they naturally are — their expressive style, <strong>not</strong> their ability.
        Temperament shapes how well they FIT certain films (Project Fit), never their OVR, star power,
        or quality. Presets set only temperament and cost nothing.
      </p>

      <div>
        <span className="hint">Presets (persona only — no bonus)</span>
        <div className="btn-row" data-testid="creator-preset-row" style={{ flexWrap: 'wrap' }}>
          {AUTHORED_TEMPERAMENT_PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`option${activeKey === p.key ? ' selected' : ''}`}
              style={{ width: 'auto' }}
              onClick={() => applyPreset(p)}
              data-testid={`creator-preset-${p.key}`}
              title={p.blurb}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-3" style={{ marginTop: 8 }}>
        <AxisSlider
          id="warmth"
          label="Emotional Temperature"
          low="Reserved"
          high="Warm"
          value={persona.warmth}
          onChange={(v) => onChange({ ...persona, warmth: v })}
        />
        <AxisSlider
          id="gravity"
          label="Tonal Instinct"
          low="Playful"
          high="Serious"
          value={persona.gravity}
          onChange={(v) => onChange({ ...persona, gravity: v })}
        />
        <AxisSlider
          id="physicality"
          label="Expressive Energy"
          low="Subtle"
          high="Kinetic"
          value={persona.physicality}
          onChange={(v) => onChange({ ...persona, physicality: v })}
        />
      </div>

      <div className="fact-block">
        <strong>How they read</strong>
        <div className="hint" data-testid="creator-temper-summary">
          {temperamentSummary(persona)}
        </div>
      </div>
    </div>
  )
}
