// ── Full Custom talent creator (D-11.A A3, Phase 5.2A cycle-2) ────────────────
// Directly edits the AUTHORITATIVE underlying attributes (no creation budget). The
// player sets skills / fame / work ethic / temperament / genre experience directly;
// OVR is DERIVED by the engine (customTalentPreview) and is NEVER an input. Fit is
// NEVER shown here (it depends on the specific film/assignment). The engine
// (createCustomTalent) is the sole validator and returns rejections as DATA, surfaced
// loudly in an error box. A deliberately powerful talent (e.g. all skills 99) is
// intentionally creatable — nothing here blocks it.
//
// Only the authoritative editable fields are ever mutated by presets/inputs: skills,
// ceilings, genre experience, fame, work ethic, persona, age, role, name. OVR / tier /
// contract offers are read-only preview output. No Math.random anywhere.

import { useMemo, useState } from 'react'
import type {
  GameState,
  CreativeRole,
  Discipline,
  Genre,
  Persona,
  CustomTalentInput,
  ContractOffer,
} from '../../engine/adapter.ts'
import {
  createCustomTalent,
  customTalentPreview,
  primaryDiscipline,
  DISCIPLINES,
  DISCIPLINE_LABEL,
  SKILL_ORDER,
  GENRE_ORDER,
} from '../../engine/adapter.ts'
import { ErrorBox } from '../common.tsx'

// ── vocabulary / display maps ────────────────────────────────────────────────

const ROLES: { value: CreativeRole; label: string }[] = [
  { value: 'writer', label: 'Writer' },
  { value: 'director', label: 'Director' },
  { value: 'actor', label: 'Actor' },
  { value: 'craft', label: 'Craft' },
]

// Human labels for the six skill keys of each discipline (in SKILL_ORDER order).
const SKILL_LABELS: Record<Discipline, string[]> = {
  acting: [
    'Acting Technique',
    'Emotional Range',
    'Dialogue Delivery',
    'Comic Timing',
    'Physical Performance',
    'Screen Presence',
  ],
  writing: [
    'Story Structure',
    'Character Development',
    'Dialogue',
    'Originality',
    'Narrative Pacing',
    'Rewriting',
  ],
  directing: [
    'Visual Storytelling',
    'Performance Direction',
    'Tone Control',
    'Pacing',
    'Production Management',
    'Adaptability',
  ],
  craft: [
    'Cinematography',
    'Editing',
    'Production Design',
    'Sound & Music',
    'Effects Execution',
    'Technical Coordination',
  ],
}

const GENRE_LABEL: Record<Genre, string> = {
  comedy: 'Comedy',
  drama: 'Drama',
  crime: 'Crime',
  romance: 'Romance',
  horror: 'Horror',
  adventure: 'Adventure',
}

// Player-friendly genre-experience buckets → stored numeric value (0..100).
const GENRE_BUCKETS: { label: string; value: number }[] = [
  { label: 'No Experience', value: 0 },
  { label: 'Limited', value: 25 },
  { label: 'Familiar', value: 50 },
  { label: 'Experienced', value: 75 },
  { label: 'Expert', value: 95 },
]

// ── bounds helpers (never emit NaN / Infinity / out-of-range) ─────────────────

function clampInt(raw: number, lo: number, hi: number, fallback: number): number {
  if (!Number.isFinite(raw)) return fallback
  const n = Math.round(raw)
  if (n < lo) return lo
  if (n > hi) return hi
  return n
}

const clampSkill = (raw: number) => clampInt(raw, 1, 99, 1)
const clampFame = (raw: number) => clampInt(raw, 0, 100, 0)
const clampWorkEthic = (raw: number) => clampInt(raw, 1, 99, 50)
const clampAge = (raw: number) => clampInt(raw, 18, 70, 18)

// ── the persistent draft (mirrors CustomTalentInput; always well-formed) ──────

type Draft = {
  name: string
  role: CreativeRole
  age: number
  actual: Persona
  workEthic: number
  fame: number
  skills: Record<Discipline, number[]>
  // Ceilings are ALWAYS a full 6-per-discipline array here (defaulting to skill);
  // only emitted to the engine when the player opens the advanced ceilings panel.
  ceilings: Record<Discipline, number[]>
  ceilingsEnabled: boolean
  genreExperience: Record<Discipline, Record<Genre, number>>
}

function zeroSkills(fill: number): Record<Discipline, number[]> {
  const out = {} as Record<Discipline, number[]>
  for (const d of DISCIPLINES) out[d] = SKILL_ORDER[d].map(() => fill)
  return out
}

function zeroGenres(): Record<Discipline, Record<Genre, number>> {
  const out = {} as Record<Discipline, Record<Genre, number>>
  for (const d of DISCIPLINES) {
    const row = {} as Record<Genre, number>
    for (const g of GENRE_ORDER) row[g] = 0
    out[d] = row
  }
  return out
}

function initialDraft(): Draft {
  const skills = zeroSkills(1)
  return {
    name: '',
    role: 'actor',
    age: 18, // D-12 P8: default age 18
    actual: { warmth: 0, gravity: 0, physicality: 0 },
    workEthic: 50,
    fame: 0,
    skills,
    ceilings: cloneSkills(skills),
    ceilingsEnabled: false,
    genreExperience: zeroGenres(),
  }
}

function cloneSkills(s: Record<Discipline, number[]>): Record<Discipline, number[]> {
  const out = {} as Record<Discipline, number[]>
  for (const d of DISCIPLINES) out[d] = [...s[d]]
  return out
}

// ── presets: fill ONLY the authoritative editable fields (never the name) ─────

type PresetKey =
  | 'blank'
  | 'balancedPro'
  | 'prospect'
  | 'star'
  | 'actingSpecialist'
  | 'writerDirector'
  | 'craftSpecialist'

const PRESETS: { value: PresetKey; label: string }[] = [
  { value: 'blank', label: 'Blank' },
  { value: 'balancedPro', label: 'Balanced Professional' },
  { value: 'prospect', label: 'Promising Prospect' },
  { value: 'star', label: 'Established Star' },
  { value: 'actingSpecialist', label: 'Acting Specialist' },
  { value: 'writerDirector', label: 'Writer-Director' },
  { value: 'craftSpecialist', label: 'Craft Specialist' },
]

// Build a fresh skills map from a per-discipline value function.
function skillsFrom(fn: (d: Discipline) => number): Record<Discipline, number[]> {
  const out = {} as Record<Discipline, number[]>
  for (const d of DISCIPLINES) out[d] = SKILL_ORDER[d].map(() => clampSkill(fn(d)))
  return out
}

// Apply a preset to the draft: replaces skills / fame / work ethic only.
function applyPreset(d: Draft, key: PresetKey): Draft {
  const primary = primaryDiscipline(d.role)
  let skills = d.skills
  let fame = d.fame
  let workEthic = d.workEthic
  switch (key) {
    case 'blank':
      skills = skillsFrom(() => 1)
      fame = 0
      workEthic = 50
      break
    case 'balancedPro':
      skills = skillsFrom(() => 60)
      fame = 40
      workEthic = 60
      break
    case 'prospect':
      skills = skillsFrom((disc) => (disc === primary ? 55 : 35))
      fame = 20
      workEthic = 75
      break
    case 'star':
      skills = skillsFrom((disc) => (disc === primary ? 85 : 45))
      fame = 85
      workEthic = 65
      break
    case 'actingSpecialist':
      skills = skillsFrom((disc) => (disc === 'acting' ? 88 : 40))
      fame = 60
      break
    case 'writerDirector':
      skills = skillsFrom((disc) => (disc === 'writing' || disc === 'directing' ? 80 : 45))
      fame = 35
      break
    case 'craftSpecialist':
      skills = skillsFrom((disc) => (disc === 'craft' ? 85 : 40))
      fame = 30
      break
  }
  // Ceilings track the (new) skills unless the player has explicitly raised them;
  // resetting to skills on preset keeps ceilings ≥ skills invariant trivially true.
  return { ...d, skills, fame: clampFame(fame), workEthic: clampWorkEthic(workEthic), ceilings: cloneSkills(skills) }
}

// ── draft → engine input ──────────────────────────────────────────────────────

function toInput(d: Draft): CustomTalentInput {
  const input: CustomTalentInput = {
    name: d.name.trim(),
    role: d.role,
    age: clampAge(d.age),
    actual: d.actual,
    workEthic: clampWorkEthic(d.workEthic),
    fame: clampFame(d.fame),
    skills: cloneSkills(d.skills),
  }
  if (d.ceilingsEnabled) {
    // Emit ceilings only when advanced panel is on; each ≥ its skill, ≤ 99.
    const ceilings = {} as Record<Discipline, number[]>
    for (const disc of DISCIPLINES) {
      ceilings[disc] = SKILL_ORDER[disc].map((_, i) => {
        const skill = d.skills[disc][i] ?? 1
        return clampInt(d.ceilings[disc][i] ?? skill, skill, 99, skill)
      })
    }
    input.ceilings = ceilings
  }
  // Genre experience: emit only non-zero cells to keep the payload lean.
  const ge: NonNullable<CustomTalentInput['genreExperience']> = {}
  for (const disc of DISCIPLINES) {
    const row: Partial<Record<Genre, number>> = {}
    let any = false
    for (const g of GENRE_ORDER) {
      const v = clampInt(d.genreExperience[disc][g] ?? 0, 0, 100, 0)
      if (v > 0) {
        row[g] = v
        any = true
      }
    }
    if (any) ge[disc] = row
  }
  if (Object.keys(ge).length > 0) input.genreExperience = ge
  return input
}

// ── stages ─────────────────────────────────────────────────────────────────

type Stage = 'identity' | 'profession' | 'skills' | 'genre' | 'potential' | 'review'
const STAGE_ORDER: Stage[] = ['identity', 'profession', 'skills', 'genre', 'potential', 'review']
const STAGE_LABELS: Record<Stage, string> = {
  identity: 'Identity',
  profession: 'Profession',
  skills: 'Skills',
  genre: 'Genre',
  potential: 'Potential',
  review: 'Review',
}

// ── persona axis slider (local to this editor) ────────────────────────────────

function PersonaSlider({
  axis,
  label,
  low,
  high,
  value,
  onChange,
}: {
  axis: keyof Persona
  label: string
  low: string
  high: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <div className="stack">
      <label htmlFor={`custom-persona-${axis}`}>
        {label}: <strong className="mono">{value.toFixed(2)}</strong>
      </label>
      <input
        id={`custom-persona-${axis}`}
        type="range"
        min={-1}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={`custom-persona-${axis}`}
      />
      <div className="spread hint">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

// ── discipline skills block (collapsible; primary expanded by default) ────────

function DisciplineSkills({
  discipline,
  isPrimary,
  values,
  open,
  onToggle,
  onSkill,
}: {
  discipline: Discipline
  isPrimary: boolean
  values: number[]
  open: boolean
  onToggle: () => void
  onSkill: (index: number, value: number) => void
}) {
  return (
    <div className="panel stack" data-testid={`custom-skillgroup-${discipline}`}>
      <button
        type="button"
        className="ghost spread"
        style={{ width: '100%' }}
        onClick={onToggle}
        data-testid={`custom-skillgroup-toggle-${discipline}`}
      >
        <strong>
          {DISCIPLINE_LABEL[discipline]} skills{isPrimary ? ' (primary)' : ''}
        </strong>
        <span className="mono">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="grid grid-2">
          {SKILL_LABELS[discipline].map((label, i) => (
            <div className="stack" key={i}>
              <label htmlFor={`custom-skill-${discipline}-${i}`}>{label}</label>
              <input
                id={`custom-skill-${discipline}-${i}`}
                type="number"
                min={1}
                max={99}
                step={1}
                value={values[i] ?? 1}
                onChange={(e) => onSkill(i, clampSkill(Number(e.target.value)))}
                data-testid={`custom-skill-${discipline}-${i}`}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── the editor ─────────────────────────────────────────────────────────────

export function FullCustomCreator({
  state,
  onCreated,
}: {
  state: GameState
  onCreated: (next: GameState) => void
}) {
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [stage, setStage] = useState<Stage>('identity')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [preset, setPreset] = useState<PresetKey>('blank')

  // Which discipline groups are expanded (skills + genre panels). Primary open.
  const primary = primaryDiscipline(draft.role)
  const [openSkills, setOpenSkills] = useState<Record<Discipline, boolean>>(() => {
    const o = {} as Record<Discipline, boolean>
    for (const d of DISCIPLINES) o[d] = d === primary
    return o
  })
  const [openGenres, setOpenGenres] = useState<Record<Discipline, boolean>>(() => {
    const o = {} as Record<Discipline, boolean>
    for (const d of DISCIPLINES) o[d] = d === primary
    return o
  })

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  // Live derived preview: OVR / tiers / contract offers recompute from the draft.
  const preview = useMemo(() => customTalentPreview(state, toInput(draft)), [state, draft])

  const stageIdx = STAGE_ORDER.indexOf(stage)
  const isReview = stage === 'review'

  function go(next: Stage) {
    setError(null)
    setStage(next)
  }
  function back() {
    if (stageIdx > 0) go(STAGE_ORDER[stageIdx - 1]!)
  }
  function next() {
    if (stageIdx < STAGE_ORDER.length - 1) go(STAGE_ORDER[stageIdx + 1]!)
  }
  function canAdvance(): boolean {
    if (stage === 'identity') return draft.name.trim().length > 0
    return true
  }

  function setRole(role: CreativeRole) {
    const p = primaryDiscipline(role)
    patch({ role })
    // Auto-expand the new primary's skill/genre panels for the common path.
    setOpenSkills((o) => ({ ...o, [p]: true }))
    setOpenGenres((o) => ({ ...o, [p]: true }))
  }

  function onSkill(disc: Discipline, index: number, value: number) {
    setDraft((d) => {
      const skills = cloneSkills(d.skills)
      skills[disc][index] = value
      // Keep ceilings ≥ skills automatically (raise the ceiling if the skill passes it).
      const ceilings = cloneSkills(d.ceilings)
      if ((ceilings[disc][index] ?? 0) < value) ceilings[disc][index] = value
      return { ...d, skills, ceilings }
    })
  }

  function onCeiling(disc: Discipline, index: number, raw: number) {
    setDraft((d) => {
      const skill = d.skills[disc][index] ?? 1
      const ceilings = cloneSkills(d.ceilings)
      ceilings[disc][index] = clampInt(raw, skill, 99, skill)
      return { ...d, ceilings }
    })
  }

  function onGenre(disc: Discipline, g: Genre, value: number) {
    setDraft((d) => {
      const genreExperience = { ...d.genreExperience, [disc]: { ...d.genreExperience[disc], [g]: value } }
      return { ...d, genreExperience }
    })
  }

  function onPreset(key: PresetKey) {
    setPreset(key)
    setDraft((d) => applyPreset(d, key))
  }

  function handleCreate() {
    if (submitting) return // guard against double-fire
    setError(null)
    if (draft.name.trim().length === 0) {
      setError('Give the talent a name.')
      go('identity')
      return
    }
    setSubmitting(true)
    const result = createCustomTalent(state, toInput(draft))
    if (!result.ok) {
      // Engine is the sole authority — surface its rejection verbatim, loudly.
      setError(result.error)
      setSubmitting(false)
      return
    }
    // Stay disabled through navigation so a fast double-click cannot create two.
    onCreated(result.next)
  }

  return (
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      {/* ── Left: active stage ── */}
      <div className="stack">
        {/* Stage indicator. */}
        <div className="steps" data-testid="custom-stages">
          {STAGE_ORDER.map((s) => (
            <span
              key={s}
              className={`step${s === stage ? ' active' : ''}${STAGE_ORDER.indexOf(s) < stageIdx ? ' done' : ''}`}
              data-testid={`custom-stage-${s}`}
            >
              {STAGE_LABELS[s]}
            </span>
          ))}
        </div>

        {stage === 'identity' && (
          <div className="card stack">
            <h2>Who are they?</h2>
            <label htmlFor="talent-name">Name</label>
            <input
              id="talent-name"
              type="text"
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              data-testid="talent-name"
            />
            <label htmlFor="talent-role">Primary profession</label>
            <select
              id="talent-role"
              value={draft.role}
              onChange={(e) => setRole(e.target.value as CreativeRole)}
              data-testid="talent-role"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} ({DISCIPLINE_LABEL[primaryDiscipline(r.value)]})
                </option>
              ))}
            </select>
            <label htmlFor="custom-age">Age (18–70)</label>
            {/* D-12 P3: accessible integer dropdown (keyboard nav + type-to-select) instead of a spinner. */}
            <select
              id="custom-age"
              value={draft.age}
              onChange={(e) => patch({ age: clampAge(Number(e.target.value)) })}
              data-testid="custom-age"
            >
              {Array.from({ length: 70 - 18 + 1 }, (_, i) => 18 + i).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <h3 style={{ marginBottom: 0 }}>Creative Temperament</h3>
            <p className="hint" style={{ fontSize: 11 }}>
              Their expressive nature (not ability). Affects Project Fit, never OVR.
            </p>
            <div className="grid grid-3">
              <PersonaSlider
                axis="warmth"
                label="Emotional Temperature"
                low="Reserved"
                high="Warm"
                value={draft.actual.warmth}
                onChange={(v) => patch({ actual: { ...draft.actual, warmth: v } })}
              />
              <PersonaSlider
                axis="gravity"
                label="Tonal Instinct"
                low="Playful"
                high="Serious"
                value={draft.actual.gravity}
                onChange={(v) => patch({ actual: { ...draft.actual, gravity: v } })}
              />
              <PersonaSlider
                axis="physicality"
                label="Expressive Energy"
                low="Subtle"
                high="Kinetic"
                value={draft.actual.physicality}
                onChange={(v) => patch({ actual: { ...draft.actual, physicality: v } })}
              />
            </div>
          </div>
        )}

        {stage === 'profession' && (
          <div className="card stack">
            <h2>Profession &amp; style</h2>
            <label htmlFor="custom-preset">Start from a preset</label>
            <select
              id="custom-preset"
              value={preset}
              onChange={(e) => onPreset(e.target.value as PresetKey)}
              data-testid="custom-preset"
            >
              {PRESETS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="hint" style={{ fontSize: 11 }}>
              A preset just fills the editable fields (skills, star power, work ethic) — you can then edit
              anything.
            </p>
            <div className="warn" data-testid="custom-balance-notice">
              Full Custom allows unrestricted talent creation and may significantly affect game balance.
            </div>
          </div>
        )}

        {stage === 'skills' && (
          <div className="card stack">
            <h2>Professional skills</h2>
            <p className="hint" style={{ fontSize: 11 }}>
              Each skill is a whole number 1–99. OVR is derived from these — it is shown live on the
              right and never edited directly.
            </p>
            {DISCIPLINES.map((d) => (
              <DisciplineSkills
                key={d}
                discipline={d}
                isPrimary={d === primary}
                values={draft.skills[d]}
                open={openSkills[d]}
                onToggle={() => setOpenSkills((o) => ({ ...o, [d]: !o[d] }))}
                onSkill={(i, v) => onSkill(d, i, v)}
              />
            ))}
          </div>
        )}

        {stage === 'genre' && (
          <div className="card stack">
            <h2>Genre experience</h2>
            <p className="hint" style={{ fontSize: 11 }}>
              How much history they have in each genre, per discipline. Defaults to No Experience.
            </p>
            {DISCIPLINES.map((d) => {
              const open = openGenres[d]
              return (
                <div className="panel stack" key={d} data-testid={`custom-genregroup-${d}`}>
                  <button
                    type="button"
                    className="ghost spread"
                    style={{ width: '100%' }}
                    onClick={() => setOpenGenres((o) => ({ ...o, [d]: !o[d] }))}
                    data-testid={`custom-genregroup-toggle-${d}`}
                  >
                    <strong>
                      {DISCIPLINE_LABEL[d]}
                      {d === primary ? ' (primary)' : ''}
                    </strong>
                    <span className="mono">{open ? '−' : '+'}</span>
                  </button>
                  {open && (
                    <div className="grid grid-2">
                      {GENRE_ORDER.map((g) => (
                        <div className="stack" key={g}>
                          <label htmlFor={`custom-genre-${d}-${g}`}>{GENRE_LABEL[g]}</label>
                          <select
                            id={`custom-genre-${d}-${g}`}
                            value={draft.genreExperience[d][g]}
                            onChange={(e) => onGenre(d, g, Number(e.target.value))}
                            data-testid={`custom-genre-${d}-${g}`}
                          >
                            {GENRE_BUCKETS.map((b) => (
                              <option key={b.value} value={b.value}>
                                {b.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {stage === 'potential' && (
          <div className="card stack">
            <h2>Potential &amp; work ethic</h2>
            <div className="grid grid-2">
              <div className="stack">
                <label htmlFor="custom-fame">Star Power (0–100)</label>
                <input
                  id="custom-fame"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  value={draft.fame}
                  onChange={(e) => patch({ fame: clampFame(Number(e.target.value)) })}
                  data-testid="custom-fame"
                />
              </div>
              <div className="stack">
                <label htmlFor="custom-workethic">Work Ethic (1–99)</label>
                <input
                  id="custom-workethic"
                  type="number"
                  min={1}
                  max={99}
                  step={1}
                  value={draft.workEthic}
                  onChange={(e) => patch({ workEthic: clampWorkEthic(Number(e.target.value)) })}
                  data-testid="custom-workethic"
                />
              </div>
            </div>

            <div className="panel stack">
              <button
                type="button"
                className="ghost spread"
                style={{ width: '100%' }}
                onClick={() => patch({ ceilingsEnabled: !draft.ceilingsEnabled })}
                data-testid="custom-ceilings-toggle"
              >
                <strong>Advanced: set potential ceilings</strong>
                <span className="mono">{draft.ceilingsEnabled ? '−' : '+'}</span>
              </button>
              {draft.ceilingsEnabled && (
                <div className="stack">
                  <p className="hint" style={{ fontSize: 11 }}>
                    Per-skill ceilings are the hidden upside a skill can grow to (≥ the current skill,
                    ≤ 99). Default is the skill value — no hidden upside.
                  </p>
                  {DISCIPLINES.map((d) => (
                    <div className="stack" key={d}>
                      <strong>{DISCIPLINE_LABEL[d]}</strong>
                      <div className="grid grid-2">
                        {SKILL_LABELS[d].map((label, i) => (
                          <div className="stack" key={i}>
                            <label htmlFor={`custom-ceiling-${d}-${i}`}>{label}</label>
                            <input
                              id={`custom-ceiling-${d}-${i}`}
                              type="number"
                              min={draft.skills[d][i] ?? 1}
                              max={99}
                              step={1}
                              value={draft.ceilings[d][i] ?? draft.skills[d][i] ?? 1}
                              onChange={(e) => onCeiling(d, i, Number(e.target.value))}
                              data-testid={`custom-ceiling-${d}-${i}`}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {stage === 'review' && (
          <div className="card stack" data-testid="custom-review">
            <h2>Review</h2>
            <div className="fact-block stack">
              <div className="spread">
                <span>Name</span>
                <strong data-testid="custom-review-name">{draft.name.trim() || '(unnamed)'}</strong>
              </div>
              <div className="spread">
                <span>Primary profession</span>
                <span className="mono" data-testid="custom-review-primary">
                  {DISCIPLINE_LABEL[preview.primaryDiscipline]}
                </span>
              </div>
              <div className="spread">
                <span>Age</span>
                <span className="mono">{clampAge(draft.age)}</span>
              </div>
              <div className="spread">
                <span>Star Power</span>
                <span className="mono">{clampFame(draft.fame)}</span>
              </div>
              <div className="spread">
                <span>Work Ethic</span>
                <span className="mono">{clampWorkEthic(draft.workEthic)}</span>
              </div>
            </div>

            <OvrTable disciplines={preview.disciplines} />

            <ContractPreview offers={preview.offers} />

            <p className="hint" style={{ fontSize: 11 }}>
              Project Fit is not shown here because it depends on the specific film / assignment — the
              same person fits different projects differently.
            </p>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 4 }}>
            <ErrorBox message={error} />
          </div>
        )}

        <div className="btn-row" style={{ marginTop: 8 }}>
          <button onClick={back} disabled={stageIdx === 0} data-testid="custom-back">
            Back
          </button>
          {!isReview ? (
            <button className="primary" onClick={next} disabled={!canAdvance()} data-testid="custom-next">
              Next
            </button>
          ) : (
            <button
              className="accent"
              onClick={handleCreate}
              disabled={submitting || draft.name.trim().length === 0}
              data-testid="create-talent"
            >
              {submitting ? 'Adding…' : 'Add to the pool'}
            </button>
          )}
        </div>
      </div>

      {/* ── Right: live derived preview (OVR + contract) ── */}
      <div className="stack">
        <div className="card stack" data-testid="custom-live-preview">
          <h3 style={{ marginTop: 0 }}>Derived OVR (live)</h3>
          <p className="hint" style={{ fontSize: 11 }}>
            OVR updates from your skills — it is never an input.
          </p>
          <OvrTable disciplines={preview.disciplines} />
        </div>
      </div>
    </div>
  )
}

// ── read-only derived OVR table ──────────────────────────────────────────────

function OvrTable({
  disciplines,
}: {
  disciplines: { discipline: Discipline; label: string; ovr: number; tier: string; isPrimary: boolean }[]
}) {
  return (
    <div className="stack">
      {disciplines.map((d) => (
        <div className="spread" key={d.discipline}>
          <span>
            {DISCIPLINE_LABEL[d.discipline]}
            {d.isPrimary ? ' (primary)' : ''}
          </span>
          <span className="mono" data-testid={`custom-ovr-${d.discipline}`}>
            <strong>{d.ovr}</strong> ({d.tier})
          </span>
        </div>
      ))}
    </div>
  )
}

// ── estimated contract offers preview ────────────────────────────────────────

function fmtMoney(n: number): string {
  return `$${Math.round(n).toLocaleString('en-US')}`
}

function ContractPreview({ offers }: { offers: ContractOffer[] }) {
  return (
    <div className="stack" data-testid="custom-contract-preview">
      <strong>Estimated contract offers</strong>
      <div className="stack">
        {offers.map((o) => (
          <div className="spread" key={o.termWeeks} data-testid={`custom-offer-${o.termWeeks}`}>
            <span>{Math.round(o.termWeeks / 52)}-yr term</span>
            <span className="mono">
              {fmtMoney(o.annualSalary)}/yr · {fmtMoney(o.signingBonus)} bonus
            </span>
          </div>
        ))}
      </div>
      <p className="hint" style={{ fontSize: 11 }}>
        Estimated salary demand and signing bonus per term length.
      </p>
    </div>
  )
}
