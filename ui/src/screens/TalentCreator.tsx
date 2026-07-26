// ── Talent creator (§10) ─────────────────────────────────────────────────────
// The contracted authored-talent path: name, role, age, chosen persona axes.
// Discloses that it starts at the contracted starting skill/fame (AUTHORED_START_*).
// The created talent appears immediately in the correct pool. No progression/bios/
// portraits. Persona is authored; capability is earned.

import { useState } from 'react'
import type { GameState, CreativeRole, AuthoredTalentInput } from '../engine/adapter.ts'
import { createTalent, AUTHORED_START } from '../engine/adapter.ts'
import { ErrorBox } from '../components/common.tsx'

const ROLES: { value: CreativeRole; label: string }[] = [
  { value: 'writer', label: 'Writer' },
  { value: 'director', label: 'Director' },
  { value: 'actor', label: 'Actor' },
  { value: 'craft', label: 'Craft' },
]

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

export function TalentCreator({
  state,
  onCreated,
  onBack,
}: {
  state: GameState
  onCreated: (next: GameState) => void
  onBack: () => void
}) {
  const [name, setName] = useState('')
  const [role, setRole] = useState<CreativeRole>('actor')
  const [age, setAge] = useState(35)
  const [warmth, setWarmth] = useState(0)
  const [gravity, setGravity] = useState(0)
  const [physicality, setPhysicality] = useState(0)
  const [error, setError] = useState<string | null>(null)

  function handleCreate() {
    setError(null)
    if (name.trim().length === 0) {
      setError('Give the talent a name.')
      return
    }
    const input: AuthoredTalentInput = {
      name: name.trim(),
      role,
      age,
      actual: { warmth, gravity, physicality },
    }
    const result = createTalent(state, input)
    if (!result.ok) {
      setError(result.error)
      return
    }
    onCreated(result.next)
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="mark">CREATE TALENT</span>
        </div>
        <button className="ghost" onClick={onBack} data-testid="talent-creator-back">
          Back to studio
        </button>
      </div>

      <div className="grid grid-2">
        <div className="card stack">
          <h2>Who are they?</h2>
          <label htmlFor="talent-name">Name</label>
          <input
            id="talent-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            data-testid="talent-name"
          />
          <label htmlFor="talent-role">Role</label>
          <select
            id="talent-role"
            value={role}
            onChange={(e) => setRole(e.target.value as CreativeRole)}
            data-testid="talent-role"
          >
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
          <label htmlFor="talent-age">Age: {age}</label>
          <input
            id="talent-age"
            type="range"
            min={18}
            max={70}
            step={1}
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            data-testid="talent-age"
          />
        </div>

        <div className="card stack">
          <h2>Their natural profile</h2>
          <p className="hint">
            You author who they naturally are. This is their expressive nature — not their ability.
          </p>
          <AxisSlider
            id="warmth"
            label="Warmth"
            low="Cold"
            high="Warm"
            value={warmth}
            onChange={setWarmth}
          />
          <AxisSlider
            id="gravity"
            label="Gravity"
            low="Light"
            high="Grave"
            value={gravity}
            onChange={setGravity}
          />
          <AxisSlider
            id="physicality"
            label="Physicality"
            low="Still"
            high="Physical"
            value={physicality}
            onChange={setPhysicality}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="warn" data-testid="authored-disclosure">
          New talent starts as an unknown: known ability <strong>{AUTHORED_START.skill}</strong> and
          fame <strong>{AUTHORED_START.fame}</strong>. They become valuable only by being cast and
          performing — you do not set skill or fame.
        </div>
        {error && (
          <div style={{ marginTop: 12 }}>
            <ErrorBox message={error} />
          </div>
        )}
        <div className="btn-row" style={{ marginTop: 12 }}>
          <button className="accent" onClick={handleCreate} data-testid="create-talent">
            Add to the pool
          </button>
        </div>
      </div>
    </div>
  )
}
