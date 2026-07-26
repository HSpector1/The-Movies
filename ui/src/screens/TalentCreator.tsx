// ── Talent creator (§10 / D-9.14) — staged authored-talent flow ──────────────
// Redesigned (Phase 5.1, Agent C) into a staged creator over the D-9 frozen core.
// The player authors a person; the ENGINE constructs and validates them.
//
// Stages: Identity → Temperament → Potential → Work Ethic → Emphasis → Review.
//
// The three OWNER-RULING guardrails this screen enforces/surfaces:
//   1. NO FREE 99-OVR SUPERSTAR. Potential + work ethic + skill emphasis + a
//      secondary discipline all draw on one fixed pool (AUTHORED_BUDGET = 100). A live
//      budget meter shows spend; an over-budget request disables submit AND is rejected
//      loudly by the engine (createTalent) if it is somehow attempted.
//   2. REAL ATTRIBUTES, NOT BONUSES. Every choice maps to actual hidden attributes with
//      tradeoffs. Temperament presets set ONLY persona (no skill/potential/WE bonus).
//   3. HONEST PRESENTATION. Authored talent START LOW (a low starting OVR) and grow
//      toward the tier's HIDDEN ceiling via development + work ethic. The chosen tier is
//      a ceiling estimate (shown as a band, flagged uncertain), never current ability;
//      work ethic affects development only. A live starting-OVR preview makes this plain.
//
// The engine is the sole validator: createTalent returns any rejection (over-budget /
// invalid role/age/WE) as DATA, surfaced here loudly. No Math.random anywhere.

import { useMemo, useState } from 'react'
import type {
  GameState,
  CreativeRole,
  AuthoredTalentInput,
  PotentialTier,
  Persona,
  SkillBias,
} from '../engine/adapter.ts'
import {
  createTalent,
  previewCreationBudget,
  previewAuthoredStartOVR,
  authoredTierInfo,
  primaryDiscipline,
  DISCIPLINE_LABEL,
  temperamentSummary,
  workEthicLabel,
  roleTier,
  AUTHORED_START,
} from '../engine/adapter.ts'
import { ErrorBox } from '../components/common.tsx'
import { BudgetMeter } from '../components/creator/BudgetMeter.tsx'
import { TemperamentStep } from '../components/creator/TemperamentStep.tsx'
import { PotentialStep } from '../components/creator/PotentialStep.tsx'
import { WorkEthicStep } from '../components/creator/WorkEthicStep.tsx'
import { EmphasisStep } from '../components/creator/EmphasisStep.tsx'

const ROLES: { value: CreativeRole; label: string }[] = [
  { value: 'writer', label: 'Writer' },
  { value: 'director', label: 'Director' },
  { value: 'actor', label: 'Actor' },
  { value: 'craft', label: 'Craft' },
]

type Stage = 'identity' | 'temperament' | 'potential' | 'workEthic' | 'emphasis' | 'review'
const STAGE_ORDER: Stage[] = ['identity', 'temperament', 'potential', 'workEthic', 'emphasis', 'review']
const STAGE_LABELS: Record<Stage, string> = {
  identity: 'Identity',
  temperament: 'Temperament',
  potential: 'Potential',
  workEthic: 'Work Ethic',
  emphasis: 'Emphasis',
  review: 'Review',
}

// The persistent creator draft (UI-only; assembled into AuthoredTalentInput on submit).
type Draft = {
  name: string
  role: CreativeRole
  age: number
  persona: Persona
  potentialTier: PotentialTier
  workEthic: number
  biasEnabled: boolean
  biasSkillIndex: number
  biasMagnitude: number
  secondaryRole: CreativeRole | null
}

function initialDraft(): Draft {
  return {
    name: '',
    role: 'actor',
    age: 35,
    persona: { warmth: 0, gravity: 0, physicality: 0 },
    potentialTier: AUTHORED_START.defaultPotentialTier,
    workEthic: AUTHORED_START.defaultWorkEthic,
    biasEnabled: false,
    biasSkillIndex: 0,
    biasMagnitude: 0.5,
    secondaryRole: null,
  }
}

// The effective bias magnitude that drives BOTH cost and the SkillBias sent to the
// engine (0 when emphasis is off — no bias, no cost).
function effectiveBiasMagnitude(d: Draft): number {
  return d.biasEnabled ? d.biasMagnitude : 0
}

// Assemble the AuthoredTalentInput the engine consumes. skillBias is included only
// when emphasis is enabled; secondaryDiscipline only when a role is chosen.
function toAuthoredInput(d: Draft): AuthoredTalentInput {
  const input: AuthoredTalentInput = {
    name: d.name.trim(),
    role: d.role,
    age: d.age,
    actual: d.persona,
    potentialTier: d.potentialTier,
    workEthic: d.workEthic,
  }
  if (d.biasEnabled) {
    const bias: SkillBias = {
      discipline: primaryDiscipline(d.role),
      skillIndex: d.biasSkillIndex,
      magnitude: d.biasMagnitude,
    }
    input.skillBias = bias
  }
  if (d.secondaryRole) input.secondaryDiscipline = d.secondaryRole
  return input
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
  const [draft, setDraft] = useState<Draft>(initialDraft)
  const [stage, setStage] = useState<Stage>('identity')
  const [error, setError] = useState<string | null>(null)

  const patch = (p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p }))

  const biasMag = effectiveBiasMagnitude(draft)
  const budget = useMemo(
    () =>
      previewCreationBudget({
        potentialTier: draft.potentialTier,
        workEthic: draft.workEthic,
        biasMagnitude: biasMag,
        hasSecondary: draft.secondaryRole !== null,
      }),
    [draft.potentialTier, draft.workEthic, biasMag, draft.secondaryRole],
  )

  // Honest starting-OVR preview: LOW start, independent of the chosen (hidden) ceiling.
  // Computed by the ENGINE (through a throwaway build) so it is exact, not a UI guess.
  const previewBias: SkillBias | undefined = draft.biasEnabled
    ? { discipline: primaryDiscipline(draft.role), skillIndex: draft.biasSkillIndex, magnitude: draft.biasMagnitude }
    : undefined
  const startOVR = useMemo(
    () => previewAuthoredStartOVR(state, draft.role, previewBias),
    [state, draft.role, draft.biasEnabled, draft.biasSkillIndex, draft.biasMagnitude],
  )
  const startTier = roleTier(startOVR)
  const tierInfo = authoredTierInfo(draft.potentialTier)

  const stageIdx = STAGE_ORDER.indexOf(stage)
  const isReview = stage === 'review'

  function go(next: Stage) {
    setError(null)
    setStage(next)
  }
  function back() {
    if (stageIdx === 0) {
      onBack()
      return
    }
    go(STAGE_ORDER[stageIdx - 1]!)
  }
  function next() {
    if (stageIdx < STAGE_ORDER.length - 1) go(STAGE_ORDER[stageIdx + 1]!)
  }

  // Per-stage "can advance" gate. Identity needs a name; a global over-budget state
  // blocks leaving the two budget-spending stages (potential/emphasis/workEthic) — but
  // the hard block is on SUBMIT (review), so the meter is visible while the player fixes it.
  function canAdvance(): boolean {
    if (stage === 'identity') return draft.name.trim().length > 0
    return true
  }

  function handleCreate() {
    setError(null)
    if (draft.name.trim().length === 0) {
      setError('Give the talent a name.')
      go('identity')
      return
    }
    if (budget.overBudget) {
      // Defensive: the button is disabled when over budget, but never rely on the UI —
      // surface it loudly and do NOT attempt the engine call.
      setError(
        `Over budget by ${(-budget.remaining).toFixed(1)}. Lower potential, work ethic, skill emphasis or drop the secondary discipline.`,
      )
      return
    }
    const result = createTalent(state, toAuthoredInput(draft))
    if (!result.ok) {
      // Engine is the sole authority — surface its rejection verbatim, loudly.
      setError(result.error)
      return
    }
    onCreated(result.next)
  }

  const weCost = budget.lines.find((l) => l.key === 'workEthic')?.cost ?? 0
  const biasCost = budget.lines.find((l) => l.key === 'bias')?.cost ?? 0
  const secondaryCost = budget.lines.find((l) => l.key === 'secondary')?.cost ?? 0

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

      {/* Stage indicator (mirrors the Assembly wizard). */}
      <div className="steps" data-testid="creator-stages">
        {STAGE_ORDER.map((s) => (
          <span
            key={s}
            className={`step${s === stage ? ' active' : ''}${STAGE_ORDER.indexOf(s) < stageIdx ? ' done' : ''}`}
            data-testid={`creator-stage-${s}`}
          >
            {STAGE_LABELS[s]}
          </span>
        ))}
      </div>

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* ── Left: the active stage ── */}
        <div className="stack">
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
              <label htmlFor="talent-role">Primary discipline</label>
              <select
                id="talent-role"
                value={draft.role}
                onChange={(e) => patch({ role: e.target.value as CreativeRole })}
                data-testid="talent-role"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} ({DISCIPLINE_LABEL[primaryDiscipline(r.value)]})
                  </option>
                ))}
              </select>
              <label htmlFor="talent-age">Age: {draft.age}</label>
              <input
                id="talent-age"
                type="range"
                min={18}
                max={70}
                step={1}
                value={draft.age}
                onChange={(e) => patch({ age: Number(e.target.value) })}
                data-testid="talent-age"
              />
              <p className="hint" style={{ fontSize: 11 }}>
                Younger talent gets more development runway toward its ceiling (age affects growth, not
                current ability).
              </p>
            </div>
          )}

          {stage === 'temperament' && (
            <TemperamentStep persona={draft.persona} onChange={(persona) => patch({ persona })} />
          )}

          {stage === 'potential' && (
            <PotentialStep
              tier={draft.potentialTier}
              onChange={(potentialTier) => patch({ potentialTier })}
            />
          )}

          {stage === 'workEthic' && (
            <WorkEthicStep
              workEthic={draft.workEthic}
              weCost={weCost}
              onChange={(workEthic) => patch({ workEthic })}
            />
          )}

          {stage === 'emphasis' && (
            <EmphasisStep
              role={draft.role}
              biasEnabled={draft.biasEnabled}
              biasSkillIndex={draft.biasSkillIndex}
              biasMagnitude={draft.biasMagnitude}
              biasCost={biasCost}
              secondaryRole={draft.secondaryRole}
              secondaryCost={secondaryCost}
              onToggleBias={(biasEnabled) => patch({ biasEnabled })}
              onBiasSkillIndex={(biasSkillIndex) => patch({ biasSkillIndex })}
              onBiasMagnitude={(biasMagnitude) => patch({ biasMagnitude })}
              onSecondary={(secondaryRole) => patch({ secondaryRole })}
            />
          )}

          {stage === 'review' && (
            <ReviewCard
              draft={draft}
              startOVR={startOVR}
              startTier={startTier}
              tierLabel={tierInfo.label}
              ceilingLow={tierInfo.ceilingLow}
              ceilingHigh={tierInfo.ceilingHigh}
            />
          )}

          {error && (
            <div style={{ marginTop: 4 }}>
              <ErrorBox message={error} />
            </div>
          )}

          <div className="btn-row" style={{ marginTop: 8 }}>
            <button onClick={back} data-testid="creator-back">
              {stageIdx === 0 ? 'Cancel' : 'Back'}
            </button>
            {!isReview ? (
              <button
                className="primary"
                onClick={next}
                disabled={!canAdvance()}
                data-testid="creator-next"
              >
                Next
              </button>
            ) : (
              <button
                className="accent"
                onClick={handleCreate}
                disabled={budget.overBudget || draft.name.trim().length === 0}
                data-testid="create-talent"
              >
                Add to the pool
              </button>
            )}
          </div>
        </div>

        {/* ── Right: persistent budget meter + honest start preview + disclosure ── */}
        <div className="stack">
          <BudgetMeter preview={budget} />

          <div className="card stack" data-testid="creator-start-preview">
            <h3 style={{ marginTop: 0 }}>Starting ability (honest)</h3>
            <div className="spread">
              <span>Starting OVR</span>
              <span className="mono">
                <strong data-testid="creator-start-ovr">{startOVR}</strong> ({startTier})
              </span>
            </div>
            <div className="spread">
              <span>Ceiling estimate ({tierInfo.label})</span>
              <span className="mono" data-testid="creator-start-ceiling">
                {tierInfo.ceilingLow}–{tierInfo.ceilingHigh}{' '}
                <span className="tag estimate">hidden</span>
              </span>
            </div>
            <p className="hint" style={{ fontSize: 11 }}>
              They <strong>start low</strong> and grow toward the ceiling through development and work
              ethic. The chosen tier is a hidden ceiling estimate, not current ability. Work ethic only
              affects how fast they develop.
            </p>
          </div>

          <div className="card">
            <div className="warn" data-testid="authored-disclosure">
              New talent starts as an unknown: their skills begin near a starting level and fame is fixed
              at <strong>{AUTHORED_START.fame}</strong>. They become valuable only by being cast and
              performing — you do not set skill or fame directly. Potential and work ethic shape only how
              they develop, never their starting quality.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Review card: the created prospect summary before commit ───────────────────
function ReviewCard({
  draft,
  startOVR,
  startTier,
  tierLabel,
  ceilingLow,
  ceilingHigh,
}: {
  draft: Draft
  startOVR: number
  startTier: string
  tierLabel: string
  ceilingLow: number
  ceilingHigh: number
}) {
  const primary = primaryDiscipline(draft.role)
  return (
    <div className="card stack" data-testid="creator-review">
      <h2>Review</h2>
      <div className="fact-block stack">
        <div className="spread">
          <span>Name</span>
          <strong data-testid="review-name">{draft.name.trim() || '(unnamed)'}</strong>
        </div>
        <div className="spread">
          <span>Primary discipline</span>
          <span className="mono">{DISCIPLINE_LABEL[primary]}</span>
        </div>
        <div className="spread">
          <span>Age</span>
          <span className="mono">{draft.age}</span>
        </div>
        <div className="spread">
          <span>Temperament</span>
          <span className="hint" data-testid="review-temper">
            {temperamentSummary(draft.persona)}
          </span>
        </div>
        <div className="spread">
          <span>Starting OVR (honest)</span>
          <span className="mono" data-testid="review-start-ovr">
            {startOVR} ({startTier})
          </span>
        </div>
        <div className="spread">
          <span>Potential ceiling ({tierLabel})</span>
          <span className="mono">
            {ceilingLow}–{ceilingHigh} <span className="tag estimate">hidden / uncertain</span>
          </span>
        </div>
        <div className="spread">
          <span>Work ethic</span>
          <span className="mono">
            {draft.workEthic} · {workEthicLabel(draft.workEthic)}
          </span>
        </div>
        <div className="spread">
          <span>Skill emphasis</span>
          <span className="mono" data-testid="review-emphasis">
            {draft.biasEnabled ? `Specialist (${draft.biasMagnitude.toFixed(2)})` : 'Generalist'}
          </span>
        </div>
        <div className="spread">
          <span>Secondary discipline</span>
          <span className="mono" data-testid="review-secondary">
            {draft.secondaryRole ? DISCIPLINE_LABEL[primaryDiscipline(draft.secondaryRole)] : 'None'}
          </span>
        </div>
      </div>
      <p className="hint" style={{ fontSize: 11 }}>
        On commit the studio constructs this person from your choices. They enter the pool at the low
        starting OVR above and grow toward the hidden ceiling with work. You never set skill or fame.
      </p>
    </div>
  )
}
