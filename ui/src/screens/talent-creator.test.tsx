// ── INDEPENDENT talent-creator suite ─────────────────────────────────────────
// Governing rule (Phase-5 authorization / contract §10):
//   • Valid authored talent is created and appears in the correct pool.
//   • Invalid input is rejected (surfaced to the UI, not a crash).
//   • The contracted starting skill/fame are disclosed; the player cannot set them.
//   • On creation perceived == actual; player authors persona, not capability.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { TalentCreator } from './TalentCreator.tsx'
import {
  newGame,
  talentByRole,
  findTalent,
  createTalent,
  AUTHORED_START,
  TUNING,
} from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'

afterEach(cleanup)

describe('talent creator: valid authored talent appears in the correct pool', () => {
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
    // Role default is actor. Persona sliders default to 0. Age default 35.
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
    fireEvent.click(screen.getByTestId('create-talent'))

    expect(next).not.toBeNull()
    expect(talentByRole(next!, 'writer').length).toBe(beforeWriters + 1)
    // Not added to the actor pool.
    expect(talentByRole(next!, 'actor').length).toBe(beforeActors)
    const created = talentByRole(next!, 'writer').find((t) => t.name === 'Pen Scrivener')!
    expect(created.role).toBe('writer')
  })
})

describe('talent creator: contracted starting skill/fame are disclosed and not player-set', () => {
  it('the disclosure shows the contracted AUTHORED_START skill and fame', () => {
    const state = newGame('tc-disclose-1')
    render(<TalentCreator state={state} onCreated={() => {}} onBack={() => {}} />)
    const disclosure = screen.getByTestId('authored-disclosure')
    // Adapter constants trace back to TUNING (contract §10 / §16).
    expect(AUTHORED_START.skill).toBe(TUNING.AUTHORED_START_SKILL)
    expect(AUTHORED_START.fame).toBe(TUNING.AUTHORED_START_FAME)
    // The disclosed numbers are the contracted starting values.
    expect(disclosure.textContent ?? '').toContain(String(TUNING.AUTHORED_START_SKILL))
    expect(disclosure.textContent ?? '').toContain(String(TUNING.AUTHORED_START_FAME))
  })

  it('the created talent starts at exactly AUTHORED_START skill/fame (player never sets them)', () => {
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
    // No skill/fame inputs exist in the UI at all — the player cannot set them.
    expect(screen.queryByTestId('talent-skill')).toBeNull()
    expect(screen.queryByTestId('talent-fame')).toBeNull()
    fireEvent.click(screen.getByTestId('create-talent'))

    const created = talentByRole(next!, 'actor').find((t) => t.name === 'Fresh Face')!
    expect(created.skill).toBe(TUNING.AUTHORED_START_SKILL)
    expect(created.fame).toBe(TUNING.AUTHORED_START_FAME)
    // perceived == actual on creation (authored persona is fully known at first).
    const raw = findTalent(next!, created.id)!
    expect(raw.perceived).toEqual(raw.actual)
    expect(raw.authored).toBe(true)
  })
})

describe('talent creator: invalid input is rejected and surfaced to the UI', () => {
  it('an empty name is rejected with an on-screen error (no crash, no creation)', () => {
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
    // Leave the name blank and try to create.
    fireEvent.click(screen.getByTestId('create-talent'))
    expect(created).toBe(false)
    // An error is shown to the player.
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('an out-of-range age is rejected by the engine and surfaced (not a crash)', () => {
    // The age slider is bounded 18..70 in the UI, so we exercise the adapter path
    // directly for the engine rejection (the UI would never emit age 5), proving the
    // engine's §10 age bound (18..70) is enforced and surfaced as data.
    const state = newGame('tc-invalid-2')
    const r = createTalent(state, {
      name: 'Too Young',
      role: 'actor',
      age: 5,
      actual: { warmth: 0, gravity: 0, physicality: 0 },
    })
    expect(r.ok).toBe(false)
    if (r.ok) return
    expect(r.error.length).toBeGreaterThan(0)
  })
})
