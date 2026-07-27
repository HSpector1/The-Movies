// ── Balanced Career creator (D-11.C, Phase 5.2A cycle-3) ──────────────────────
// The specialization flow: the player picks a profession + archetype preset, then
// spends a fixed SPECIALIZATION_POINTS pool sculpting a prospect's six-skill profile
// and genre experience. Potential tier + work ethic are a SEPARATE player-chosen
// tradeoff (NOT bought with points). OVR is DERIVED by the engine
// (balancedTalentPreview) and is NEVER an input. Fit is never shown (film-dependent).
//
// The engine (createBalancedTalent) is the sole validator and returns rejections as
// DATA, surfaced loudly in an error box. This flow is deliberately restrained: a
// Balanced person is a prospect, not an instant superstar — Full Custom is the path to
// an immediate star. No Math.random anywhere.
//
// Owner IA (stages): Identity → Profession & preset → Specialization → Review & contract.

import { useMemo, useState } from 'react'
import type {
  GameState,
  CreativeRole,
  Discipline,
  Genre,
  Persona,
  PotentialTier,
  ArchetypePreset,
  BalancedTalentInput,
  ContractOffer,
} from '../../engine/adapter.ts'
import {
  balancedArchetypes,
  balancedBoostDiscipline,
  createBalancedTalent,
  balancedTalentPreview,
  SPECIALIZATION_POINTS,
  BALANCED_SKILL_FLOOR,
  DISCIPLINES,
  DISCIPLINE_LABEL,
  ROLE_TO_DISCIPLINE,
  SKILL_ORDER,
  GENRE_ORDER,
  AUTHORED_POTENTIAL_TIERS,
} from '../../engine/adapter.ts'
import { ErrorBox } from '../common.tsx'
import { money } from '../../format.ts'

// ── vocabulary / display maps (mirror FullCustomCreator conventions) ──────────

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

const TIER_LABEL: Record<PotentialTier, string> = {
  Limited: 'Limited',
  Steady: 'Steady',
  Promising: 'Promising',
  HighUpside: 'High Upside',
  ExceptionalUpside: 'Exceptional Upside',
  GenerationalUpside: 'Generational Upside',
}

// Player-friendly genre-experience buckets, keyed off the PROPOSED numeric value
// (baseline + increment). Thresholds at ~0/20/40/60/85 per the owner IA.
function genreBucketLabel(value: number): string {
  if (value >= 85) return 'Expert'
  if (value >= 60) return 'Experienced'
  if (value >= 40) return 'Familiar'
  if (value >= 20) return 'Limited'
  return 'No Experience'
}

// ── bounds / arithmetic helpers ───────────────────────────────────────────────

function clampInt(raw: number, lo: number, hi: number, fallback: number): number {
  if (!Number.isFinite(raw)) return fallback
  const n = Math.round(raw)
  if (n < lo) return lo
  if (n > hi) return hi
  return n
}
const clampAge = (raw: number) => clampInt(raw, 18, 70, 35)

// The per-discipline skill BASELINE from a preset: floor 15 → the preset's primarySkills
// vector for the primary discipline; secondaryBaseline for others; a raised secondary is
// applied via secondaryBoost. Every value ≥ BALANCED_SKILL_FLOOR by construction.
function baselineSkills(preset: ArchetypePreset, primary: Discipline): Record<Discipline, number[]> {
  const out = {} as Record<Discipline, number[]>
  // Use the engine's shared boost-discipline rule so the displayed baseline can never
  // diverge from the constructed talent (e.g. a director multi-hyphenate boosts writing).
  const boostDisc = balancedBoostDiscipline(preset, primary)
  for (const d of DISCIPLINES) {
    if (d === primary) {
      out[d] = SKILL_ORDER[d].map((_, i) => Math.max(BALANCED_SKILL_FLOOR, preset.primarySkills[i] ?? preset.secondaryBaseline))
    } else if (boostDisc && d === boostDisc && preset.secondaryBoost) {
      out[d] = SKILL_ORDER[d].map((_, i) => Math.max(BALANCED_SKILL_FLOOR, preset.secondaryBoost!.skills[i] ?? preset.secondaryBaseline))
    } else {
      out[d] = SKILL_ORDER[d].map(() => Math.max(BALANCED_SKILL_FLOOR, preset.secondaryBaseline))
    }
  }
  return out
}

// The primary-discipline genre-experience baseline from the preset (others start at 0).
function baselineGenres(preset: ArchetypePreset, primary: Discipline): Record<Discipline, Record<Genre, number>> {
  const out = {} as Record<Discipline, Record<Genre, number>>
  for (const d of DISCIPLINES) {
    const row = {} as Record<Genre, number>
    for (const g of GENRE_ORDER) row[g] = d === primary ? (preset.genreBaseline[g] ?? 0) : 0
    out[d] = row
  }
  return out
}

// An empty allocation (all zeros) — the shape held in the draft. Selecting a preset
// RESETS this to empty so points are never duplicated.
function emptyAllocation(): { skills: Record<Discipline, number[]>; genre: Record<Discipline, Record<Genre, number>> } {
  const skills = {} as Record<Discipline, number[]>
  const genre = {} as Record<Discipline, Record<Genre, number>>
  for (const d of DISCIPLINES) {
    skills[d] = SKILL_ORDER[d].map(() => 0)
    const row = {} as Record<Genre, number>
    for (const g of GENRE_ORDER) row[g] = 0
    genre[d] = row
  }
  return { skills, genre }
}

// ── the persistent draft ───────────────────────────────────────────────────────

type Alloc = { skills: Record<Discipline, number[]>; genre: Record<Discipline, Record<Genre, number>> }

type Draft = {
  name: string
  role: CreativeRole
  age: number
  actual: Persona
  presetId: string
  potentialTier: PotentialTier
  workEthic: number
  allocation: Alloc
}

function presetsFor(role: CreativeRole): readonly ArchetypePreset[] {
  const disc = ROLE_TO_DISCIPLINE[role]
  return balancedArchetypes().filter((p) => p.appliesTo === disc || p.appliesTo === 'any')
}

function initialDraft(): Draft {
  const role: CreativeRole = 'actor'
  const preset = presetsFor(role)[0]!
  return {
    name: '',
    role,
    age: 35,
    actual: { warmth: 0, gravity: 0, physicality: 0 },
    presetId: preset.id,
    potentialTier: preset.defaultPotentialTier,
    workEthic: preset.defaultWorkEthic,
    allocation: emptyAllocation(),
  }
}

// Total specialization points spent in the current allocation.
function pointsSpent(alloc: Alloc): number {
  let used = 0
  for (const d of DISCIPLINES) {
    for (const v of alloc.skills[d]) used += Math.max(0, v)
    for (const g of GENRE_ORDER) used += Math.max(0, alloc.genre[d][g] ?? 0)
  }
  return used
}

// Assemble the engine input from the draft. Only non-zero increments are emitted, so
// the payload is lean and the engine's point accounting matches the UI's exactly.
function toInput(d: Draft): BalancedTalentInput {
  const skills: Partial<Record<Discipline, number[]>> = {}
  const genre: Partial<Record<Discipline, Partial<Record<Genre, number>>>> = {}
  for (const disc of DISCIPLINES) {
    if (d.allocation.skills[disc].some((v) => v > 0)) skills[disc] = [...d.allocation.skills[disc]]
    const row: Partial<Record<Genre, number>> = {}
    let any = false
    for (const g of GENRE_ORDER) {
      const v = d.allocation.genre[disc][g] ?? 0
      if (v > 0) {
        row[g] = v
        any = true
      }
    }
    if (any) genre[disc] = row
  }
  const allocation: BalancedTalentInput['allocation'] = {}
  if (Object.keys(skills).length > 0) allocation.skills = skills
  if (Object.keys(genre).length > 0) allocation.genre = genre
  return {
    name: d.name.trim(),
    role: d.role,
    age: clampAge(d.age),
    actual: d.actual,
    presetId: d.presetId,
    potentialTier: d.potentialTier,
    workEthic: d.workEthic,
    allocation,
  }
}

// ── stages ─────────────────────────────────────────────────────────────────

type Stage = 'identity' | 'profession' | 'specialization' | 'review'
const STAGE_ORDER: Stage[] = ['identity', 'profession', 'specialization', 'review']
const STAGE_LABELS: Record<Stage, string> = {
  identity: 'Identity',
  profession: 'Profession & preset',
  specialization: 'Specialization',
  review: 'Review & contract',
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
      <label htmlFor={`balanced-persona-${axis}`}>
        {label}: <strong className="mono">{value.toFixed(2)}</strong>
      </label>
      <input
        id={`balanced-persona-${axis}`}
        type="range"
        min={-1}
        max={1}
        step={0.05}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={`balanced-persona-${axis}`}
      />
      <div className="spread hint">
        <span>{low}</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

// ── a single skill stepper (baseline → proposed, +/-) ─────────────────────────

function SkillStepper({
  discipline,
  index,
  label,
  baseline,
  increment,
  canAdd,
  onInc,
  onDec,
}: {
  discipline: Discipline
  index: number
  label: string
  baseline: number
  increment: number
  canAdd: boolean
  onInc: () => void
  onDec: () => void
}) {
  const proposed = baseline + increment
  return (
    <div className="spread" data-testid={`balanced-skill-${discipline}-${index}`}>
      <span>
        {label}:{' '}
        <span className="mono">
          {baseline} → {proposed}
          {increment > 0 ? ` (+${increment})` : ''}
        </span>
      </span>
      <span className="btn-row">
        <button
          type="button"
          className="ghost"
          onClick={onDec}
          disabled={increment <= 0}
          aria-label={`Decrease ${label}`}
          data-testid={`balanced-skill-${discipline}-${index}-dec`}
        >
          −
        </button>
        <button
          type="button"
          className="ghost"
          onClick={onInc}
          disabled={!canAdd || proposed >= 99}
          aria-label={`Increase ${label}`}
          data-testid={`balanced-skill-${discipline}-${index}-inc`}
        >
          +
        </button>
      </span>
    </div>
  )
}

// ── a single genre-experience stepper (bucket + increase) ─────────────────────

const GENRE_STEP = 5 // points per press for genre experience (kept small; caps at 100)

function GenreStepper({
  discipline,
  genre,
  baseline,
  increment,
  canAdd,
  onInc,
  onDec,
}: {
  discipline: Discipline
  genre: Genre
  baseline: number
  increment: number
  canAdd: boolean
  onInc: () => void
  onDec: () => void
}) {
  const proposed = baseline + increment
  return (
    <div className="spread" data-testid={`balanced-genre-${discipline}-${genre}`}>
      <span>
        {GENRE_LABEL[genre]} Experience:{' '}
        <span className="mono">
          {genreBucketLabel(proposed)}
          {increment > 0 ? ` (+${increment})` : ''}
        </span>
      </span>
      <span className="btn-row">
        <button
          type="button"
          className="ghost"
          onClick={onDec}
          disabled={increment <= 0}
          aria-label={`Decrease ${GENRE_LABEL[genre]} experience`}
          data-testid={`balanced-genre-${discipline}-${genre}-dec`}
        >
          −
        </button>
        <button
          type="button"
          className="ghost"
          onClick={onInc}
          disabled={!canAdd || proposed >= 100}
          aria-label={`Increase ${GENRE_LABEL[genre]} experience`}
          data-testid={`balanced-genre-${discipline}-${genre}-inc`}
        >
          +
        </button>
      </span>
    </div>
  )
}

// ── the editor ─────────────────────────────────────────────────────────────

export function BalancedCareerCreator({
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
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const primary = ROLE_TO_DISCIPLINE[draft.role]
  const presets = useMemo(() => presetsFor(draft.role), [draft.role])
  const preset = useMemo(
    () => presets.find((p) => p.id === draft.presetId) ?? presets[0]!,
    [presets, draft.presetId],
  )

  // Preset-derived baselines (memoized). Increments (draft.allocation) sit on top.
  const skillBaseline = useMemo(() => baselineSkills(preset, primary), [preset, primary])
  const genreBaseline = useMemo(() => baselineGenres(preset, primary), [preset, primary])

  const spent = pointsSpent(draft.allocation)
  const remaining = SPECIALIZATION_POINTS - spent
  const canAdd = remaining > 0

  // Live derived preview from the ENGINE (OVR / tiers / contract offers). OVR is never
  // an input; the whole six-skill profile drives it, so points ≠ OVR one-for-one.
  const preview = useMemo(() => balancedTalentPreview(state, toInput(draft)), [state, draft])

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

  // Changing the profession re-filters presets, defaults to the first valid preset for
  // that discipline, and RESETS the allocation (points are preset-relative).
  function setRole(role: CreativeRole) {
    const list = presetsFor(role)
    const first = list[0]!
    setAdvancedOpen(false)
    setDraft((d) => ({
      ...d,
      role,
      presetId: first.id,
      potentialTier: first.defaultPotentialTier,
      workEthic: first.defaultWorkEthic,
      allocation: emptyAllocation(),
    }))
  }

  // Selecting a preset RESETS the specialization allocation to empty (never duplicate
  // points) and defaults the potential/work-ethic tradeoff from that preset.
  function setPreset(id: string) {
    const p = presets.find((x) => x.id === id) ?? presets[0]!
    setDraft((d) => ({
      ...d,
      presetId: p.id,
      potentialTier: p.defaultPotentialTier,
      workEthic: p.defaultWorkEthic,
      allocation: emptyAllocation(),
    }))
  }

  function bumpSkill(disc: Discipline, index: number, delta: number) {
    setDraft((d) => {
      const skills = {} as Record<Discipline, number[]>
      for (const dd of DISCIPLINES) skills[dd] = [...d.allocation.skills[dd]]
      const base = skillBaseline[disc][index] ?? BALANCED_SKILL_FLOOR
      const curInc = skills[disc][index] ?? 0
      // Never push proposed above 99, never below the baseline (increment ≥ 0), and
      // never spend more than the remaining pool on an increase.
      const room = SPECIALIZATION_POINTS - pointsSpent(d.allocation)
      let step = delta
      if (step > 0) step = Math.min(step, room, 99 - (base + curInc))
      else step = Math.max(step, -curInc)
      skills[disc][index] = curInc + step
      return { ...d, allocation: { ...d.allocation, skills } }
    })
  }

  function bumpGenre(disc: Discipline, g: Genre, delta: number) {
    setDraft((d) => {
      const genre = {} as Record<Discipline, Record<Genre, number>>
      for (const dd of DISCIPLINES) genre[dd] = { ...d.allocation.genre[dd] }
      const base = genreBaseline[disc][g] ?? 0
      const curInc = genre[disc][g] ?? 0
      const room = SPECIALIZATION_POINTS - pointsSpent(d.allocation)
      let step = delta
      if (step > 0) step = Math.min(step, room, 100 - (base + curInc))
      else step = Math.max(step, -curInc)
      genre[disc][g] = curInc + step
      return { ...d, allocation: { ...d.allocation, genre } }
    })
  }

  function handleCreate() {
    if (submitting) return // guard against double-fire
    setError(null)
    if (draft.name.trim().length === 0) {
      setError('Give the talent a name.')
      go('identity')
      return
    }
    if (spent > SPECIALIZATION_POINTS) {
      setError(`Over budget by ${spent - SPECIALIZATION_POINTS} points. Lower some allocations.`)
      return
    }
    setSubmitting(true)
    const result = createBalancedTalent(state, toInput(draft))
    if (!result.ok) {
      // Engine is the sole authority — surface its rejection verbatim, loudly.
      setError(result.error)
      setSubmitting(false)
      return
    }
    // Stay disabled through navigation so a fast double-click cannot create two.
    onCreated(result.next)
  }

  // Creation is invalid only if over-budget (leaving points unspent is allowed).
  const overBudget = spent > SPECIALIZATION_POINTS

  // The disciplines to render in the emphasis-first specialization body: primary first,
  // the rest behind the Advanced expandable.
  const otherDisciplines = DISCIPLINES.filter((d) => d !== primary)

  return (
    <div className="grid grid-2" style={{ alignItems: 'start' }}>
      {/* ── Left: active stage ── */}
      <div className="stack">
        {/* Stage indicator. */}
        <div className="steps" data-testid="balanced-stages">
          {STAGE_ORDER.map((s) => (
            <span
              key={s}
              className={`step${s === stage ? ' active' : ''}${STAGE_ORDER.indexOf(s) < stageIdx ? ' done' : ''}`}
              data-testid={`balanced-stage-${s}`}
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
                  {r.label} ({DISCIPLINE_LABEL[ROLE_TO_DISCIPLINE[r.value]]})
                </option>
              ))}
            </select>
            <label htmlFor="custom-age">Age (18–70)</label>
            <input
              id="custom-age"
              type="number"
              min={18}
              max={70}
              step={1}
              value={draft.age}
              onChange={(e) => patch({ age: clampAge(Number(e.target.value)) })}
              data-testid="custom-age"
            />
            <p className="hint" style={{ fontSize: 11 }}>
              Younger talent gets more development runway toward its ceiling (age affects growth, not
              current ability).
            </p>
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
            <h2>Profession &amp; preset</h2>
            <label htmlFor="balanced-preset">Career archetype</label>
            <select
              id="balanced-preset"
              value={draft.presetId}
              onChange={(e) => setPreset(e.target.value)}
              data-testid="balanced-preset"
            >
              {presets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
            <p className="hint" style={{ fontSize: 11 }}>
              The archetype sets a starting six-skill profile and a little genre experience. Choosing one
              resets your specialization spend. You then sculpt from there with {SPECIALIZATION_POINTS}{' '}
              points.
            </p>

            <h3 style={{ marginBottom: 0 }}>Potential &amp; work ethic</h3>
            <p className="hint" style={{ fontSize: 11 }}>
              A separate career tradeoff — <strong>not</strong> bought with specialization points. Potential
              is a hidden ceiling estimate; work ethic drives how fast they develop toward it.
            </p>
            <div className="grid grid-2">
              <div className="stack">
                <label htmlFor="balanced-potential">Potential tier</label>
                <select
                  id="balanced-potential"
                  value={draft.potentialTier}
                  onChange={(e) => patch({ potentialTier: e.target.value as PotentialTier })}
                  data-testid="balanced-potential"
                >
                  {AUTHORED_POTENTIAL_TIERS.map((t) => (
                    <option key={t} value={t}>
                      {TIER_LABEL[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div className="stack">
                <label htmlFor="balanced-workethic">Work Ethic: {draft.workEthic}</label>
                <input
                  id="balanced-workethic"
                  type="range"
                  min={1}
                  max={99}
                  step={1}
                  value={draft.workEthic}
                  onChange={(e) => patch({ workEthic: clampInt(Number(e.target.value), 1, 99, 50) })}
                  data-testid="balanced-workethic"
                />
              </div>
            </div>
          </div>
        )}

        {stage === 'specialization' && (
          <div className="card stack">
            <div className="spread">
              <h2 style={{ margin: 0 }}>Specialization</h2>
              <span className="mono">
                <strong data-testid="balanced-points-remaining">{remaining}</strong> / {SPECIALIZATION_POINTS} pts left
              </span>
            </div>
            <p className="hint" style={{ fontSize: 11 }}>
              Spend up to {SPECIALIZATION_POINTS} points sculpting {DISCIPLINE_LABEL[primary]}. Each point is
              +1 to a skill or genre experience. OVR reflects the whole profile — 20 points in one skill is
              not +20 OVR. Leaving points unspent is allowed.
            </p>

            {/* Primary discipline skills first. */}
            <div className="panel stack" data-testid={`balanced-skillgroup-${primary}`}>
              <strong>{DISCIPLINE_LABEL[primary]} skills (primary)</strong>
              {SKILL_LABELS[primary].map((label, i) => (
                <SkillStepper
                  key={i}
                  discipline={primary}
                  index={i}
                  label={label}
                  baseline={skillBaseline[primary][i] ?? BALANCED_SKILL_FLOOR}
                  increment={draft.allocation.skills[primary][i] ?? 0}
                  canAdd={canAdd}
                  onInc={() => bumpSkill(primary, i, 1)}
                  onDec={() => bumpSkill(primary, i, -1)}
                />
              ))}
            </div>

            {/* Primary discipline genre experience. */}
            <div className="panel stack" data-testid={`balanced-genregroup-${primary}`}>
              <strong>{DISCIPLINE_LABEL[primary]} genre experience</strong>
              {GENRE_ORDER.map((g) => (
                <GenreStepper
                  key={g}
                  discipline={primary}
                  genre={g}
                  baseline={genreBaseline[primary][g] ?? 0}
                  increment={draft.allocation.genre[primary][g] ?? 0}
                  canAdd={canAdd}
                  onInc={() => bumpGenre(primary, g, GENRE_STEP)}
                  onDec={() => bumpGenre(primary, g, -GENRE_STEP)}
                />
              ))}
            </div>

            {/* Advanced: other disciplines (multi-hyphenate / full set). */}
            <div className="panel stack">
              <button
                type="button"
                className="ghost spread"
                style={{ width: '100%' }}
                onClick={() => setAdvancedOpen((o) => !o)}
                data-testid="balanced-advanced-toggle"
              >
                <strong>Advanced: other disciplines &amp; genres</strong>
                <span className="mono">{advancedOpen ? '−' : '+'}</span>
              </button>
              {advancedOpen && (
                <div className="stack">
                  <p className="hint" style={{ fontSize: 11 }}>
                    Spend points outside {DISCIPLINE_LABEL[primary]} to build a multi-hyphenate. Same pool —
                    every point here is a point not spent on your primary craft.
                  </p>
                  {otherDisciplines.map((d) => (
                    <div className="stack" key={d} data-testid={`balanced-skillgroup-${d}`}>
                      <strong>{DISCIPLINE_LABEL[d]} skills</strong>
                      {SKILL_LABELS[d].map((label, i) => (
                        <SkillStepper
                          key={i}
                          discipline={d}
                          index={i}
                          label={label}
                          baseline={skillBaseline[d][i] ?? BALANCED_SKILL_FLOOR}
                          increment={draft.allocation.skills[d][i] ?? 0}
                          canAdd={canAdd}
                          onInc={() => bumpSkill(d, i, 1)}
                          onDec={() => bumpSkill(d, i, -1)}
                        />
                      ))}
                      <div className="stack" data-testid={`balanced-genregroup-${d}`}>
                        <span className="hint">{DISCIPLINE_LABEL[d]} genre experience</span>
                        {GENRE_ORDER.map((g) => (
                          <GenreStepper
                            key={g}
                            discipline={d}
                            genre={g}
                            baseline={genreBaseline[d][g] ?? 0}
                            increment={draft.allocation.genre[d][g] ?? 0}
                            canAdd={canAdd}
                            onInc={() => bumpGenre(d, g, GENRE_STEP)}
                            onDec={() => bumpGenre(d, g, -GENRE_STEP)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {remaining < 0 && (
              <div className="warn" data-testid="balanced-overspend">
                Over the {SPECIALIZATION_POINTS}-point budget. Lower some allocations before continuing.
              </div>
            )}
          </div>
        )}

        {stage === 'review' && (
          <div className="card stack" data-testid="balanced-review">
            <h2>Review &amp; contract</h2>
            <div className="fact-block stack">
              <div className="spread">
                <span>Name</span>
                <strong data-testid="balanced-review-name">{draft.name.trim() || '(unnamed)'}</strong>
              </div>
              <div className="spread">
                <span>Primary profession</span>
                <span className="mono" data-testid="balanced-review-primary">
                  {DISCIPLINE_LABEL[preview.primaryDiscipline]}
                </span>
              </div>
              <div className="spread">
                <span>Specialty</span>
                <span className="mono" data-testid="balanced-review-specialty">
                  {preset.label}
                </span>
              </div>
              <div className="spread">
                <span>Age</span>
                <span className="mono">{clampAge(draft.age)}</span>
              </div>
              <div className="spread">
                <span>Potential</span>
                <span className="mono">{TIER_LABEL[draft.potentialTier]}</span>
              </div>
              <div className="spread">
                <span>Work Ethic</span>
                <span className="mono">{draft.workEthic}</span>
              </div>
              <div className="spread">
                <span>Points spent</span>
                <span className="mono">
                  {preview.pointsUsed} / {SPECIALIZATION_POINTS}
                </span>
              </div>
            </div>

            <OvrTable disciplines={preview.disciplines} />

            <ContractPreview offers={preview.offers} />

            <p className="hint" style={{ fontSize: 11 }}>
              A Balanced person enters as a <strong>prospect, not a star</strong>. They grow toward their
              hidden ceiling through development and work. Full Custom is the path to an immediate superstar.
              Project Fit is not shown here — it depends on the specific film / assignment.
            </p>
          </div>
        )}

        {error && (
          <div style={{ marginTop: 4 }}>
            <ErrorBox message={error} />
          </div>
        )}

        <div className="btn-row" style={{ marginTop: 8 }}>
          <button onClick={back} disabled={stageIdx === 0} data-testid="balanced-back">
            Back
          </button>
          {!isReview ? (
            <button className="primary" onClick={next} disabled={!canAdvance()} data-testid="balanced-next">
              Next
            </button>
          ) : (
            <button
              className="accent"
              onClick={handleCreate}
              disabled={submitting || overBudget || draft.name.trim().length === 0}
              data-testid="create-talent"
            >
              {submitting ? 'Adding…' : 'Add to the pool'}
            </button>
          )}
        </div>
      </div>

      {/* ── Right: live derived panel (points + OVR + strengths + salary) ── */}
      <div className="stack">
        <div className="card stack" data-testid="balanced-live-preview">
          <div className="spread">
            <h3 style={{ marginTop: 0 }}>Live profile</h3>
            <span className="mono">
              <strong>{remaining}</strong> / {SPECIALIZATION_POINTS} pts
            </span>
          </div>
          <p className="hint" style={{ fontSize: 11 }}>
            OVR is derived from the whole six-skill profile — never an input. Spending 20 points in one skill
            is not +20 OVR.
          </p>
          <OvrTable disciplines={preview.disciplines} />
          <div className="spread">
            <span>Current standing</span>
            <span className="mono" data-testid="balanced-standing">
              ~{preview.primaryPercentile}th %ile — {preview.standing}
            </span>
          </div>
          <p className="hint" style={{ fontSize: 11 }}>
            Standing is this person&rsquo;s primary-profession OVR versus working {DISCIPLINE_LABEL[primary]}
            {' '}talent in the world (approximate). A Balanced prospect is lower-middle with upside — not a star.
          </p>
          <TopStrengths draft={draft} skillBaseline={skillBaseline} />
          <div className="spread">
            <span>Salary estimate</span>
            <span className="mono" data-testid="balanced-salary-estimate">
              {money(preview.offers[0]?.annualSalary ?? 0)}/yr
            </span>
          </div>
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
          <span className="mono" data-testid={`balanced-ovr-${d.discipline}`}>
            <strong>{d.ovr}</strong> ({d.tier})
          </span>
        </div>
      ))}
    </div>
  )
}

// ── top strengths (proposed skills in the primary discipline, descending) ─────

function TopStrengths({
  draft,
  skillBaseline,
}: {
  draft: Draft
  skillBaseline: Record<Discipline, number[]>
}) {
  const primary = ROLE_TO_DISCIPLINE[draft.role]
  const rows = SKILL_LABELS[primary]
    .map((label, i) => ({
      label,
      value: (skillBaseline[primary][i] ?? BALANCED_SKILL_FLOOR) + (draft.allocation.skills[primary][i] ?? 0),
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 3)
  return (
    <div className="stack" data-testid="balanced-top-strengths">
      <strong>Top strengths</strong>
      {rows.map((r) => (
        <div className="spread" key={r.label}>
          <span>{r.label}</span>
          <span className="mono">{r.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── estimated contract offers preview ────────────────────────────────────────

function ContractPreview({ offers }: { offers: ContractOffer[] }) {
  return (
    <div className="stack" data-testid="balanced-contract-preview">
      <strong>Estimated contract offers</strong>
      <div className="stack">
        {offers.map((o) => (
          <div className="spread" key={o.termWeeks} data-testid={`balanced-offer-${o.termWeeks}`}>
            <span>{Math.round(o.termWeeks / 52)}-yr term</span>
            <span className="mono">
              {money(o.annualSalary)}/yr · {money(o.signingBonus)} bonus
            </span>
          </div>
        ))}
      </div>
      <p className="hint" style={{ fontSize: 11 }}>
        Estimated salary demand and signing bonus per term length. Creating this person does not sign them.
      </p>
    </div>
  )
}
