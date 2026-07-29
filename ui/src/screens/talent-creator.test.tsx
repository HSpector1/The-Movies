// ── INDEPENDENT talent-creator suite (Phase 5.1 → D-11.C migration) ──────────
// Governing rules (§10 / D-9 / D-11.C). D-11.C REPLACED the old D-9.14 staged
// "Balanced budget" wizard (Identity→Temperament→Potential→WorkEthic→Emphasis→Review,
// a single 100-point budget bought tier/WE/bias/secondary) with a SPECIALIZATION flow:
// pick a profession + archetype preset, then spend a fixed 40-point pool on the six-skill
// profile + genre experience; potential/work-ethic are a SEPARATE tradeoff; OVR is DERIVED.
//
// The invariants these tests protect are UNCHANGED — only the flow they run against moved:
//   • Valid authored talent is created and lands in the CORRECT pool (actor→actor, writer→writer).
//   • Deterministic construction: same seed + same input ⇒ byte-identical talent.
//   • NO FREE SUPERSTAR: a Balanced person enters as a PROSPECT, not a star — derived OVR is
//     low-middle and its standing is well below the top decile (the D-11.C percentile rule).
//   • The player NEVER sets skill or fame; OVR is derived; presentation is honest.
//   • Selecting a preset shapes the profile and costs NO specialization points.
//   • The UI cannot submit an over-budget allocation (the 40-pt pool is structurally capped),
//     and invalid input (empty name) is surfaced/blocked, never a crash.
//   • The Full-Custom AUTHORED engine (`createTalent`) still enforces its own §10/D-9.14 budget
//     and low-start guarantees — those engine-path invariants are kept verbatim.
//
// The Balanced creator is a staged wizard (Identity → Profession & preset → Specialization →
// Review); `create-talent` lives on Review. `advanceToReview` walks it via the Next button.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { TalentCreator } from './TalentCreator.tsx'
import {
  newGame,
  talentByRole,
  findTalent,
  createTalent,
  createBalancedTalent,
  previewCreationBudget,
  roleOVR,
  SPECIALIZATION_POINTS,
  AUTHORED_BUDGET,
  AUTHORED_TIER_RANGE,
  TUNING,
} from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'

afterEach(cleanup)

// Walk the Balanced wizard from Identity to Review (Identity → Profession → Specialization →
// Review = 3 Next clicks). Assumes a name is already entered (Identity's Next gates on it).
function advanceToReview() {
  for (let i = 0; i < 3; i++) {
    fireEvent.click(screen.getByTestId('balanced-next'))
  }
}

// Read the integer at the front of a testid's text (e.g. "38 (Solid)" → 38).
function leadingInt(testid: string): number {
  const el = screen.getByTestId(testid)
  const m = (el.textContent ?? '').match(/\d+/)
  expect(m).not.toBeNull()
  return Number(m![0])
}

// ── D-12 Phase 3 — accessible age dropdown ────────────────────────────────────────────────────────
describe('D-12 P3: age is an accessible integer dropdown (18–70), default 18, preserved to Review', () => {
  function renderCreator() {
    render(<TalentCreator state={newGame('p3-age')} onCreated={() => {}} onBack={() => {}} />)
  }
  it('defaults to 18 and is a <select> bounded strictly to 18–70', () => {
    renderCreator()
    const el = screen.getByTestId('custom-age') as HTMLSelectElement
    expect(el.tagName).toBe('SELECT') // a dropdown, not a spinner
    expect(el.value).toBe('18')
    const values = Array.from(el.options).map((o) => Number(o.value))
    expect(Math.min(...values)).toBe(18)
    expect(Math.max(...values)).toBe(70)
    expect(values.length).toBe(70 - 18 + 1) // every integer, no out-of-range option
  })

  it('selects 33 directly and preserves it across steps to Review & Contract', () => {
    renderCreator()
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Older Pro' } })
    fireEvent.change(screen.getByTestId('custom-age'), { target: { value: '33' } })
    expect((screen.getByTestId('custom-age') as HTMLSelectElement).value).toBe('33')
    advanceToReview()
    expect(screen.getByTestId('balanced-review-age').textContent).toBe('33') // shown correctly on Review
  })

  it('the engine boundary still rejects ages outside [18, 70]', () => {
    const state = newGame('p3-age-engine')
    const base = {
      name: 'Age Test', role: 'actor' as const, actual: { warmth: 0, gravity: 0, physicality: 0 },
      presetId: 'balancedActingProspect', potentialTier: 'Promising' as const, workEthic: 60, allocation: {},
    }
    expect(createBalancedTalent(state, { ...base, age: 33 }).ok).toBe(true)
    expect(createBalancedTalent(state, { ...base, age: 17 }).ok).toBe(false)
    expect(createBalancedTalent(state, { ...base, age: 71 }).ok).toBe(false)
  })
})

describe('talent creator: valid talent appears in the correct pool (D-11.C Balanced flow)', () => {
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
    // Role default is actor; the default preset + zero spend is always a valid prospect.
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
  it('two identical AUTHORED creations on the same seed produce byte-identical talent', () => {
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

  it('two identical BALANCED creations on the same seed produce byte-identical talent', () => {
    const input = {
      name: 'Twin Prospect',
      role: 'actor' as const,
      age: 24,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      presetId: 'balancedActingProspect',
      potentialTier: 'Promising' as const,
      workEthic: 60,
      allocation: { skills: { acting: [4, 3, 2, 1, 0, 0] } },
    }
    const a = createBalancedTalent(newGame('tc-bal-det'), input)
    const b = createBalancedTalent(newGame('tc-bal-det'), input)
    expect(a.ok && b.ok).toBe(true)
    if (!a.ok || !b.ok) return
    const ta = talentByRole(a.next, 'actor').find((t) => t.name === 'Twin Prospect')!
    const tb = talentByRole(b.next, 'actor').find((t) => t.name === 'Twin Prospect')!
    expect(JSON.stringify(findTalent(a.next, ta.id)!)).toBe(JSON.stringify(findTalent(b.next, tb.id)!))
  })
})

describe('talent creator: NO FREE SUPERSTAR', () => {
  it('AUTHORED engine — an over-budget request (Generational + Relentless WE + strong bias + secondary) is REJECTED', () => {
    // The exact "everything maxed" superstar attempt the §10/D-9.14 budget forbids.
    const state = newGame('tc-superstar')
    const r = createTalent(state, {
      name: 'Free Superstar',
      role: 'actor',
      age: 30,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
      potentialTier: 'GenerationalUpside', // 45
      workEthic: 99, // 30
      skillBias: { discipline: 'acting', skillIndex: 0, magnitude: 1 }, // 20
      secondaryDiscipline: 'writer', // 20
    })
    // 45 + 30 + 20 + 20 = 115 > AUTHORED_BUDGET (100) → loud rejection as DATA.
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error).toMatch(/over budget/i)
    expect(state.talent.every((t) => t.name !== 'Free Superstar')).toBe(true)
  })

  it('the AUTHORED budget meter agrees with the engine: the maxed request is flagged over-budget', () => {
    const preview = previewCreationBudget({
      potentialTier: 'GenerationalUpside',
      workEthic: 99,
      biasMagnitude: 1,
      hasSecondary: true,
    })
    expect(preview.total).toBeGreaterThan(AUTHORED_BUDGET)
    expect(preview.overBudget).toBe(true)
    const ok = previewCreationBudget({
      potentialTier: 'Steady',
      workEthic: 60,
      biasMagnitude: 0,
      hasSecondary: false,
    })
    expect(ok.overBudget).toBe(false)
  })

  it('AUTHORED engine — the highest affordable tier still STARTS LOW (ceiling is hidden, not current skill)', () => {
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
    expect(startingOVR).toBeLessThan(50)
    expect(startingOVR).toBeLessThan(AUTHORED_TIER_RANGE.GenerationalUpside[0]) // 96
    expect(raw.fame).toBe(TUNING.AUTHORED_START_FAME)
  })

  it('BALANCED flow — a default prospect is a PROSPECT, not a star: derived OVR is low-middle, standing below the top decile', () => {
    const state = newGame('tc-not-a-star')
    render(<TalentCreator state={state} onCreated={() => {}} onBack={() => {}} />)
    // The live panel always shows the ENGINE-derived primary OVR and the standing percentile.
    const primaryOVR = leadingInt('balanced-ovr-acting')
    // Low-middle prospect: far below a superstar, far below the D-9 near-cap band.
    expect(primaryOVR).toBeGreaterThan(0)
    expect(primaryOVR).toBeLessThan(60)
    // D-11.C percentile rule: a Balanced default is well under the top decile (top-10% rare,
    // top-5% effectively absent). The rendered standing reports that percentile honestly.
    const percentile = leadingInt('balanced-standing')
    expect(percentile).toBeLessThan(75)
  })
})

describe('talent creator: honest presentation — OVR is derived, the player never sets skill or fame', () => {
  it('BALANCED flow surfaces a derived (never-input) OVR and the "prospect, not a star" framing', () => {
    const state = newGame('tc-honest')
    render(<TalentCreator state={state} onCreated={() => {}} onBack={() => {}} />)
    // The derived OVR is shown in the live panel; it is a plain engine number, low for a prospect.
    const ovr = leadingInt('balanced-ovr-acting')
    expect(ovr).toBeLessThan(60)
    // The live panel states OVR is derived, never an input.
    expect(screen.getByTestId('balanced-live-preview').textContent ?? '').toMatch(/derived/i)
    // No skill or fame input exists anywhere in the Balanced wizard — the player cannot set them.
    expect(screen.queryByTestId('talent-skill')).toBeNull()
    expect(screen.queryByTestId('talent-fame')).toBeNull()
  })

  it('the created Balanced talent has derived skill, perceived===actual and authored===true (skill/fame never player-set)', () => {
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
    expect(screen.queryByTestId('talent-skill')).toBeNull()
    expect(screen.queryByTestId('talent-fame')).toBeNull()
    advanceToReview()
    // Review states the honest framing before the player commits.
    expect(screen.getByTestId('balanced-review').textContent ?? '').toMatch(/prospect, not a star/i)
    fireEvent.click(screen.getByTestId('create-talent'))

    const created = talentByRole(next!, 'actor').find((t) => t.name === 'Fresh Face')!
    expect(Number.isFinite(created.skill)).toBe(true)
    const raw = findTalent(next!, created.id)!
    expect(raw.perceived).toEqual(raw.actual)
    expect(raw.authored).toBe(true)
  })
})

describe('talent creator: selecting a preset shapes the profile and costs NO specialization points', () => {
  it('picking a different archetype changes the derived OVR and leaves the full 40-point pool intact', () => {
    const state = newGame('tc-preset')
    render(<TalentCreator state={state} onCreated={() => {}} onBack={() => {}} />)
    // Identity's Next is gated on a name; give one so we can reach the Profession stage.
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Preset Person' } })
    fireEvent.click(screen.getByTestId('balanced-next')) // → profession
    const ovrBefore = leadingInt('balanced-ovr-acting')

    // Pick a different preset than the default first option.
    const sel = screen.getByTestId('balanced-preset') as HTMLSelectElement
    const other = Array.from(sel.options).find((o) => o.value !== sel.value)!
    fireEvent.change(sel, { target: { value: other.value } })

    // The archetype reshapes the derived profile → the derived OVR changed.
    expect(leadingInt('balanced-ovr-acting')).not.toBe(ovrBefore)

    // Preset selection consumes NO specialization points — the pool is still full.
    fireEvent.click(screen.getByTestId('balanced-next')) // → specialization
    expect(leadingInt('balanced-points-remaining')).toBe(SPECIALIZATION_POINTS)
  })
})

describe('talent creator: the UI cannot submit an over-budget allocation, and blocks invalid input', () => {
  it('the 40-point specialization pool is structurally capped — it cannot go negative and the created talent is in-budget', () => {
    const state = newGame('tc-ui-budget')
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
    fireEvent.change(screen.getByTestId('talent-name'), { target: { value: 'Maxed Out' } })
    fireEvent.click(screen.getByTestId('balanced-next')) // → profession
    fireEvent.click(screen.getByTestId('balanced-next')) // → specialization

    // Try to overspend: press one skill's + far more than the pool allows.
    const inc = () => fireEvent.click(screen.getByTestId('balanced-skill-acting-0-inc'))
    for (let i = 0; i < SPECIALIZATION_POINTS + 20; i++) inc()

    // Remaining is clamped at 0 (never negative) and the + button is now disabled.
    expect(leadingInt('balanced-points-remaining')).toBe(0)
    expect((screen.getByTestId('balanced-skill-acting-0-inc') as HTMLButtonElement).disabled).toBe(true)

    // The resulting talent is therefore within budget and the engine accepts it.
    fireEvent.click(screen.getByTestId('balanced-next')) // → review
    fireEvent.click(screen.getByTestId('create-talent'))
    expect(next).not.toBeNull()
    expect(talentByRole(next!, 'actor').some((t) => t.name === 'Maxed Out')).toBe(true)
  })

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
    const nextBtn = screen.getByTestId('balanced-next') as HTMLButtonElement
    expect(nextBtn.disabled).toBe(true)
    expect(screen.queryByTestId('create-talent')).toBeNull()
    expect(created).toBe(false)
  })

  it('an out-of-range age is rejected by the AUTHORED engine and surfaced (not a crash)', () => {
    // The UI age input is bounded 18..70, so exercise the adapter path directly to prove
    // the engine's §10 age bound is enforced and surfaced as data.
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
