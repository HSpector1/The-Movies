// ── INDEPENDENT talent-creator suite (Phase 5.1 staged creator, Agent C) ─────
// Governing rules (Phase-5.1 authorization / contract §10 / D-9.14 / D-9.8/10/11):
//   • Valid, within-budget authored talent is created and appears in the correct pool.
//   • An OVER-BUDGET request (Generational + Relentless WE + strong bias + secondary)
//     is REJECTED — the engine is the sole authority; the UI also disables submit.
//   • NO FREE 99-OVR SUPERSTAR: authored talent START LOW; the chosen tier is only a
//     hidden CEILING, never current ability. Starting OVR is asserted low.
//   • Honest presentation: the tier is shown as a ceiling estimate flagged uncertain;
//     work ethic is framed as development-only; the player never sets skill or fame.
//   • Invalid input is rejected (surfaced to the UI, not a crash).
//
// The creator is a staged wizard (Identity → Temperament → Potential → Work Ethic →
// Emphasis → Review); `create-talent` lives on the Review stage. `advanceToReview`
// walks the stages via the Next button.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { TalentCreator } from './TalentCreator.tsx'
import {
  newGame,
  talentByRole,
  findTalent,
  createTalent,
  previewCreationBudget,
  previewAuthoredStartOVR,
  roleOVR,
  AUTHORED_START,
  AUTHORED_BUDGET,
  AUTHORED_TIER_RANGE,
  TUNING,
} from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'

afterEach(cleanup)

// Walk the staged wizard from Identity to Review (5 Next clicks). Assumes a name is
// already entered (Identity's Next is gated on a non-empty name).
function advanceToReview() {
  for (let i = 0; i < 5; i++) {
    fireEvent.click(screen.getByTestId('creator-next'))
  }
}

describe('talent creator: valid within-budget talent appears in the correct pool', () => {
  it('creating an actor adds exactly one authored actor to the actor pool', () => {
    const state = newGame('tc-valid-1')
    const before = talentByRole(state, 'actor').length
    let next: GameState | null = null

    render(
      <TalentCreator
        state={state}
        onCreated={(s) => {
          next = s
        }}
        onBack={() => {}}
      />,
    )
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Nova Vega' } })
    // Role default is actor; defaults are within budget (Steady + WE 60, no bias/secondary).
    advanceToReview()
    fireEvent.click(screen.getByTestId('create-talent'))

    expect(next).not.toBeNull()
    const pool = talentByRole(next!, 'actor')
    expect(pool.length).toBe(before + 1)
    const created = pool.find((t) => t.authored && t.name === 'Nova Vega')!
    expect(created).toBeDefined()
  })

  it('creating a writer lands the authored talent in the WRITER pool, not others', () => {
    const state = newGame('tc-valid-2')
    const beforeWriters = talentByRole(state, 'writer').length
    const beforeActors = talentByRole(state, 'actor').length
    let next: GameState | null = null

    render(
      <TalentCreator
        state={state}
        onCreated={(s) => {
          next = s
        }}
        onBack={() => {}}
      />,
    )
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Pen Scrivener' } })
    fireEvent.change(screen.getByTestId('talent-role'), { target: { value: 'writer' } })
    advanceToReview()
    fireEvent.click(screen.getByTestId('create-talent'))

    expect(next).not.toBeNull()
    expect(talentByRole(next!, 'writer').length).toBe(beforeWriters + 1)
    expect(talentByRole(next!, 'actor').length).toBe(beforeActors)
    const created = talentByRole(next!, 'writer').find((t) => t.name === 'Pen Scrivener')!
    expect(created.role).toBe('writer')
  })
})

describe('talent creator: the creation maps deterministically (same inputs → same talent)', () => {
  it('two identical creations on the same seed produce byte-identical authored talent', () => {
    const input = {
      name: 'Twin Cast',
      role: 'actor' as const,
      age: 40,
      actual: { warmth: 0.3, gravity: -0.2, physicality: 0.5 },
      potentialTier: 'Promising' as const,
      workEthic: 55,
    }
    const a = createTalent(newGame('tc-determinism'), input)
    const b = createTalent(newGame('tc-determinism'), input)
    expect(a.ok && b.ok).toBe(true)
    if (!a.ok || !b.ok) return
    const ta = talentByRole(a.next, 'actor').find((t) => t.name === 'Twin Cast')!
    const tb = talentByRole(b.next, 'actor').find((t) => t.name === 'Twin Cast')!
    const rawA = findTalent(a.next, ta.id)!
    const rawB = findTalent(b.next, tb.id)!
    // Deterministic construction: same seed + same input ⇒ identical hidden skills.
    expect(JSON.stringify(rawA)).toBe(JSON.stringify(rawB))
  })
})

describe('talent creator: NO FREE 99-OVR SUPERSTAR (D-9.14 budget)', () => {
  it('an over-budget request (Generational + Relentless WE + strong bias + secondary) is REJECTED by the engine', () => {
    // This is the exact "everything maxed" superstar attempt the owner rule forbids.
    const state = newGame('tc-superstar')
    const r = createTalent(state, {
      name: 'Free Superstar',
      role: 'actor',
      age: 30,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      potentialTier: 'GenerationalUpside', // 45
      workEthic: 99, // 30 · 99/99 = 30
      skillBias: { discipline: 'acting', skillIndex: 0, magnitude: 1 }, // 20
      secondaryDiscipline: 'writer', // 20
    })
    // 45 + 30 + 20 + 20 = 115 > AUTHORED_BUDGET (100) → loud rejection as DATA.
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toMatch(/over budget/i)
    // The state is unchanged — no talent was created.
    expect(state.talent.every((t) => t.name !== 'Free Superstar')).toBe(true)
  })

  it('the UI meter agrees with the engine: the maxed request is flagged over-budget', () => {
    const preview = previewCreationBudget({
      potentialTier: 'GenerationalUpside',
      workEthic: 99,
      biasMagnitude: 1,
      hasSecondary: true,
    })
    expect(preview.total).toBeGreaterThan(AUTHORED_BUDGET)
    expect(preview.overBudget).toBe(true)
    // And a modest request is within budget.
    const ok = previewCreationBudget({
      potentialTier: 'Steady',
      workEthic: 60,
      biasMagnitude: 0,
      hasSecondary: false,
    })
    expect(ok.overBudget).toBe(false)
  })

  it('an authored talent created at the HIGHEST affordable tier still starts LOW (not a 99-OVR superstar)', () => {
    // Generational alone (45) + a modest WE is well within budget; the CEILING is high
    // but the STARTING OVR must be low — the tier is a hidden ceiling, not current skill.
    const state = newGame('tc-lowstart')
    const r = createTalent(state, {
      name: 'Raw Prospect',
      role: 'actor',
      age: 22,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      potentialTier: 'GenerationalUpside',
      workEthic: 40,
    })
    expect(r.ok).toBe(true)
    if (!r.ok) return
    const created = talentByRole(r.next, 'actor').find((t) => t.name === 'Raw Prospect')!
    const raw = findTalent(r.next, created.id)!
    const startingOVR = roleOVR(raw, 'acting')
    // Starts near AUTHORED_START_OVR (35), FAR below the Generational ceiling band (96–99)
    // and far below a 99-OVR superstar. A generous ceiling ⇒ NOT a high current skill.
    expect(startingOVR).toBeLessThan(50)
    expect(startingOVR).toBeLessThan(AUTHORED_TIER_RANGE.GenerationalUpside[0]) // 96
    // Fame is the fixed low authored start, never a superstar's fame.
    expect(raw.fame).toBe(TUNING.AUTHORED_START_FAME)
  })
})

describe('talent creator: the UI blocks an over-budget submit and surfaces it', () => {
  it('with an over-budget draft the review submit is disabled and the over-budget notice shows', () => {
    const state = newGame('tc-ui-budget')
    let created = false
    render(
      <TalentCreator
        state={state}
        onCreated={() => {
          created = true
        }}
        onBack={() => {}}
      />,
    )
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Maxed Out' } })
    // Potential → Generational (45).
    fireEvent.click(screen.getByTestId('creator-next')) // → temperament
    fireEvent.click(screen.getByTestId('creator-next')) // → potential
    fireEvent.click(screen.getByTestId('creator-tier-GenerationalUpside'))
    fireEvent.click(screen.getByTestId('creator-next')) // → workEthic
    fireEvent.change(screen.getByTestId('talent-workethic'), { target: { value: '99' } }) // 30
    fireEvent.click(screen.getByTestId('creator-next')) // → emphasis
    fireEvent.click(screen.getByTestId('creator-bias-toggle')) // enable bias
    fireEvent.change(screen.getByTestId('creator-bias-mag'), { target: { value: '1' } }) // 20
    fireEvent.click(screen.getByTestId('creator-secondary-writing')) // secondary 20
    // 45 + 30 + 20 + 20 = 115 > 100.
    fireEvent.click(screen.getByTestId('creator-next')) // → review

    // The meter flags over-budget and the submit button is disabled.
    expect(screen.getByTestId('creator-over-budget')).toBeInTheDocument()
    const submit = screen.getByTestId('create-talent') as HTMLButtonElement
    expect(submit.disabled).toBe(true)
    fireEvent.click(submit)
    expect(created).toBe(false)
  })
})

describe('talent creator: contracted starting fame is disclosed and skill is not player-set (D-9.14)', () => {
  it('the disclosure shows the contracted starting fame and frames skill as earned, not set', () => {
    const state = newGame('tc-disclose-1')
    render(<TalentCreator state={state} onCreated={() => {}} onBack={() => {}} />)
    const disclosure = screen.getByTestId('authored-disclosure')
    expect(AUTHORED_START.fame).toBe(TUNING.AUTHORED_START_FAME)
    expect(disclosure.textContent ?? '').toContain(String(TUNING.AUTHORED_START_FAME))
    expect(disclosure.textContent ?? '').toMatch(/do not set skill|you do not set/i)
  })

  it('honest presentation: the start-OVR preview shows a LOW starting OVR flagged as such', () => {
    const state = newGame('tc-honest')
    render(<TalentCreator state={state} onCreated={() => {}} onBack={() => {}} />)
    // The persistent preview shows the ENGINE's honest starting OVR (low), not the ceiling.
    const startOVR = Number(screen.getByTestId('creator-start-ovr').textContent)
    expect(startOVR).toBe(previewAuthoredStartOVR(state, 'actor', undefined)) // no bias yet
    // Authored talent start LOW — nowhere near a superstar or the tier ceiling band.
    expect(startOVR).toBeLessThan(50)
    // The ceiling is flagged hidden (never framed as current ability).
    expect(screen.getByTestId('creator-start-ceiling').textContent ?? '').toMatch(/hidden/i)
  })

  it('the created talent starts at the contracted fixed fame; the player never sets skill or fame', () => {
    const state = newGame('tc-disclose-2')
    let next: GameState | null = null
    render(
      <TalentCreator
        state={state}
        onCreated={(s) => {
          next = s
        }}
        onBack={() => {}}
      />,
    )
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Fresh Face' } })
    // No skill/fame inputs exist anywhere in the wizard — the player cannot set them.
    expect(screen.queryByTestId('talent-skill')).toBeNull()
    expect(screen.queryByTestId('talent-fame')).toBeNull()
    advanceToReview()
    fireEvent.click(screen.getByTestId('create-talent'))

    const created = talentByRole(next!, 'actor').find((t) => t.name === 'Fresh Face')!
    expect(created.fame).toBe(TUNING.AUTHORED_START_FAME)
    expect(Number.isFinite(created.skill)).toBe(true)
    const raw = findTalent(next!, created.id)!
    expect(raw.perceived).toEqual(raw.actual)
    expect(raw.authored).toBe(true)
  })
})

describe('talent creator: temperament presets set ONLY persona (D-9.8), no bonus', () => {
  it('picking a preset changes the live temperament summary and costs NO budget', () => {
    const state = newGame('tc-preset')
    render(<TalentCreator state={state} onCreated={() => {}} onBack={() => {}} />)
    const budgetBefore = screen.getByTestId('creator-budget-total').textContent
    // Identity's Next is gated on a name; give one so we can advance to Temperament.
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Preset Person' } })
    fireEvent.click(screen.getByTestId('creator-next')) // → temperament
    const summaryBefore = screen.getByTestId('creator-temper-summary').textContent
    fireEvent.click(screen.getByTestId('creator-preset-stoic-intense'))
    const summaryAfter = screen.getByTestId('creator-temper-summary').textContent
    // Persona changed → the deterministic summary changed.
    expect(summaryAfter).not.toBe(summaryBefore)
    // Temperament costs nothing: the budget total is unchanged by the preset.
    expect(screen.getByTestId('creator-budget-total').textContent).toBe(budgetBefore)
  })
})

describe('talent creator: invalid input is rejected and surfaced to the UI', () => {
  it('an empty name blocks advancing past Identity (no create button reachable, no crash)', () => {
    const state = newGame('tc-invalid-1')
    let created = false
    render(
      <TalentCreator
        state={state}
        onCreated={() => {
          created = true
        }}
        onBack={() => {}}
      />,
    )
    // Next is disabled while the name is blank; the create button is not reachable.
    const nextBtn = screen.getByTestId('creator-next') as HTMLButtonElement
    expect(nextBtn.disabled).toBe(true)
    expect(screen.queryByTestId('create-talent')).toBeNull()
    expect(created).toBe(false)
  })

  it('an out-of-range age is rejected by the engine and surfaced (not a crash)', () => {
    // The UI age slider is bounded 18..70, so we exercise the adapter path directly to
    // prove the engine's §10 age bound is enforced and surfaced as data.
    const state = newGame('tc-invalid-2')
    const r = createTalent(state, {
      name: 'Too Young',
      role: 'actor',
      age: 5,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      potentialTier: 'Steady',
      workEthic: 60,
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.length).toBeGreaterThan(0)
  })
})
