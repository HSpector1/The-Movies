// ── C2a-M2 — the build path a player can actually walk ───────────────────────
//
// Two surfaces, one claim: a studio can BUY the capacity C2a added, and it is told
// the truth about what it is buying.
//
//   1. THE STUDIO CATALOG carries the §3.4 slate — a Soundstage, a Post Building, a
//      Scenery Shop and a from-scratch Development & Casting Office — each with the
//      engine's own one-line effect, and each describing its capacity in the words
//      that effect line uses. "+1 shared slot" for a soundstage was engine language
//      standing in for a filmmaking fact, and a stage does not share a slot.
//   2. THE SCENERY SHOP gives the three set verbs to the player. Commission, repair
//      and strike, each with the engine's own reason AND remedy when it says no —
//      which is what stops a worn-out set being the unrelievable dead end owner law
//      2 forbids.

import { describe, it, expect } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import { applyActions } from '../../../src/core/index.ts'
import { advanceWeek, studioLotSnapshot } from '../engine/adapter.ts'
import type { GameState } from '../engine/adapter.ts'
import { lotBuildCatalog, capacityPhrase } from '../lot/buildCatalog.ts'
import { sceneryBoard, setCommissionRefusal } from '../engine/sets.ts'
import { SceneryShopPanel } from '../components/SceneryShopPanel.tsx'
import { StudioDevelopment } from './StudioDevelopment.tsx'
import { newFoundedGame } from '../test/founding.ts'

function managed(seed: string): GameState {
  return applyActions(newFoundedGame(seed), [{ kind: 'activateStudioOperations' }])
}

function catalogOf(state: GameState) {
  return lotBuildCatalog(studioLotSnapshot(state).placement)
}

const SLATE = ['stage-standard', 'post-building', 'scenery-shop', 'development-casting-office']

describe('C2a-M2 §3.4 — the studio catalog carries the slate, honestly', () => {
  it('offers all four new blueprints, each with a real one-line effect', () => {
    const catalog = catalogOf(managed('c2a-m2-catalog-1'))
    for (const id of SLATE) {
      const entry = catalog.find((row) => row.blueprintId === id)
      expect(entry, `catalog is missing ${id}`).toBeDefined()
      expect(entry!.effectSummary.length).toBeGreaterThan(20)
      expect(entry!.effectSummary.endsWith('.')).toBe(true)
      // No engine id, no kebab-case, no capability name leaking into player copy.
      expect(entry!.effectSummary).not.toMatch(/[a-z]-[a-z]+-[a-z]/)
      expect(entry!.cost).toBeGreaterThan(0)
      expect(entry!.buildWeeks).toBeGreaterThan(0)
      expect(entry!.state).toBe('buildable')
    }
  })

  it('names each capacity by what it IS — a stage is never a shared slot', () => {
    const catalog = catalogOf(managed('c2a-m2-catalog-2'))
    const labelOf = (id: string) =>
      catalog.find((row) => row.blueprintId === id)!.capacityLabel ?? ''

    expect(labelOf('stage-standard')).toBe('carries 1 picture at a time')
    expect(labelOf('post-building')).toBe('+2 cutting rooms')
    expect(labelOf('scenery-shop')).toBe('+2 scenery crews')
    expect(labelOf('development-casting-office')).toBe('+2 Development & Casting slots')

    // The C1 entries keep the vocabulary their own effect lines already used.
    expect(labelOf('development-casting-annex')).toBe('+1 Development & Casting slot')
    // An effect-only building claims no capacity at all rather than "+0".
    expect(catalog.find((row) => row.blueprintId === 'development-office-2')!.capacityLabel).toBe(
      null,
    )
    // No catalog row anywhere may describe a stage as a slot.
    for (const row of catalog) {
      if (row.capability !== 'soundstage') continue
      expect(row.capacityLabel).not.toContain('slot')
    }
  })

  it('`capacityPhrase` is total, and never guesses a word for a building it does not know', () => {
    expect(capacityPhrase('soundstage', 1)).toBe('carries 1 picture at a time')
    expect(capacityPhrase('soundstage', 2)).toBe('carries 2 pictures at a time')
    expect(capacityPhrase('post', 1)).toBe('+1 cutting room')
    expect(capacityPhrase('set-scenery', 1)).toBe('+1 scenery crew')
    expect(capacityPhrase('development-casting', 3)).toBe('+3 Development & Casting slots')
    expect(capacityPhrase('unknown-capability', 4)).toBe(null)
    expect(capacityPhrase('post', 0)).toBe(null)
    expect(capacityPhrase('post', -2)).toBe(null)
    expect(capacityPhrase('post', 1.5)).toBe(null)
  })
})

describe('C2a-M2 §3.1 — the Scenery Shop, where a set is commissioned', () => {
  it('shows every stage and what stands on it, with its whole stat block', () => {
    const state = managed('c2a-m2-shop-1')
    render(<SceneryShopPanel state={state} onChange={() => {}} />)

    const board = sceneryBoard(state)
    expect(board.stages.length).toBeGreaterThan(0)
    for (const stage of board.stages) {
      const row = screen.getByTestId(`scenery-stage-${stage.stageFacilityId}`)
      expect(row.textContent).toContain(stage.stageName)
      if (stage.mounted !== null) {
        expect(row.textContent).toContain(stage.mounted.name)
        expect(row.textContent).toContain(stage.mounted.locationLabel)
        expect(within(row).getByTestId(`scenery-set-condition-${stage.mounted.setId}`)).toBeInTheDocument()
      }
    }
  })

  it('quotes a chosen stage and set with its cost and its weeks, and commissions it', () => {
    let state = managed('c2a-m2-shop-2')
    // Strike the endowed set on the second stage so there is somewhere to build.
    const struck = state.sets.find((set) => set.mountedOn === 'facility-soundstage-12')!
    state = applyActions(state, [{ kind: 'strikeSet', setId: struck.id }])

    let latest: GameState = state
    const { rerender } = render(
      <SceneryShopPanel
        state={state}
        onChange={(next) => {
          latest = next
        }}
      />,
    )

    fireEvent.change(screen.getByTestId('scenery-stage-pick'), {
      target: { value: 'facility-soundstage-12' },
    })
    fireEvent.click(screen.getByTestId('scenery-pick-set-back-alley'))

    const quote = screen.getByTestId('scenery-commission-quote').textContent ?? ''
    expect(quote).toContain('Back Alley')
    expect(quote).toContain('$320,000')
    expect(quote).toContain('weeks')

    fireEvent.click(screen.getByTestId('scenery-commission-commit'))
    expect(latest).not.toBe(state)
    expect(latest.sets.some((set) => set.blueprintId === 'set-back-alley')).toBe(true)
    expect(latest.studio.cash).toBe(state.studio.cash - 320_000)

    rerender(<SceneryShopPanel state={latest} onChange={() => {}} />)
    expect(screen.getByTestId('scenery-receipt').textContent).toContain('Back Alley')
  })

  it('refuses a dressed stage with the engine’s own reason AND its remedy', () => {
    const state = managed('c2a-m2-shop-3')
    const dressed = state.sets.find((set) => set.status === 'standing')!
    const refusal = setCommissionRefusal(state, {
      stageFacilityId: dressed.mountedOn,
      blueprintId: 'set-back-alley',
    })
    expect(refusal).not.toBeNull()
    expect(refusal!.reason).toContain(dressed.name)
    expect(refusal!.remedy.trim().length).toBeGreaterThan(0)

    render(<SceneryShopPanel state={state} onChange={() => {}} />)
    fireEvent.change(screen.getByTestId('scenery-stage-pick'), {
      target: { value: dressed.mountedOn },
    })
    fireEvent.click(screen.getByTestId('scenery-pick-set-back-alley'))

    expect(screen.getByTestId('scenery-commission-refusal-reason').textContent).toBe(refusal!.reason)
    expect(screen.getByTestId('scenery-commission-refusal-remedy').textContent).toBe(refusal!.remedy)
    expect(screen.getByTestId('scenery-commission-commit')).toBeDisabled()
  })

  it('a worn set can be repaired, and the panel is where that is done', () => {
    const state = managed('c2a-m2-shop-4')
    const worn: GameState = {
      ...state,
      sets: state.sets.map((set, index) => (index === 0 ? { ...set, condition: 20 } : set)),
    }
    const target = worn.sets[0]!

    let latest: GameState = worn
    render(
      <SceneryShopPanel
        state={worn}
        onChange={(next) => {
          latest = next
        }}
      />,
    )
    const button = screen.getByTestId(`scenery-repair-${target.id}`)
    expect(button).not.toBeDisabled()
    fireEvent.click(button)

    expect(latest).not.toBe(worn)
    const repaired = latest.sets.find((set) => set.id === target.id)!
    expect(repaired.status).toBe('under-construction')
    expect(repaired.condition).toBe(20) // kept while the crew works — the repair marker
  })

  it('every disabled verb states why, and offers a remedy — never a silent grey button', () => {
    const state = managed('c2a-m2-shop-5')
    // A set in good repair cannot be repaired; the button must SAY so.
    render(<SceneryShopPanel state={state} onChange={() => {}} />)
    const whole = state.sets.find((set) => set.status === 'standing')!
    const button = screen.getByTestId(`scenery-repair-${whole.id}`)
    expect(button).toBeDisabled()
    const reason = screen.getByTestId(`scenery-repair-${whole.id}-refusal-reason`).textContent ?? ''
    const remedy = screen.getByTestId(`scenery-repair-${whole.id}-refusal-remedy`).textContent ?? ''
    expect(reason).toContain(whole.name)
    expect(remedy.trim().length).toBeGreaterThan(0)
    expect(reason).not.toContain('set-')
    expect(reason).not.toContain('applyActions')
  })

  it('is REACHABLE — it stands inside Studio Development, the screen already routed', () => {
    const state = managed('c2a-m2-shop-reach')
    render(<StudioDevelopment state={state} onChange={() => {}} onBack={() => {}} />)
    const shop = screen.getByTestId('scenery-shop')
    expect(shop).toBeInTheDocument()
    expect(within(shop).getByTestId('scenery-catalog')).toBeInTheDocument()
    expect(within(shop).getByTestId('scenery-stages')).toBeInTheDocument()
    // …and a legacy studio's Studio Development screen is unchanged.
    const legacy = newFoundedGame('c2a-m2-shop-reach-legacy')
    const { container } = render(
      <StudioDevelopment state={legacy} onChange={() => {}} onBack={() => {}} />,
    )
    expect(within(container as HTMLElement).queryByTestId('scenery-shop')).toBeNull()
  })

  it('renders nothing for a studio that runs no operations of its own', () => {
    const legacy = newFoundedGame('c2a-m2-shop-6')
    const { container } = render(<SceneryShopPanel state={legacy} onChange={() => {}} />)
    expect(container.firstChild).toBeNull()
  })

  it('a commissioned set stands, and the shop then says so', () => {
    let state = managed('c2a-m2-shop-7')
    const struck = state.sets.find((set) => set.mountedOn === 'facility-soundstage-12')!
    state = applyActions(state, [{ kind: 'strikeSet', setId: struck.id }])
    state = applyActions(state, [
      {
        kind: 'commissionSet',
        commission: { blueprintId: 'set-graveyard', stageFacilityId: 'facility-soundstage-12' },
      },
    ])
    const built = state.sets.find((set) => set.blueprintId === 'set-graveyard')!
    for (let week = 0; week < 12; week++) {
      if (state.sets.find((set) => set.id === built.id)!.status === 'standing') break
      state = advanceWeek(state).next
    }
    expect(state.sets.find((set) => set.id === built.id)!.status).toBe('standing')

    render(<SceneryShopPanel state={state} onChange={() => {}} />)
    const row = screen.getByTestId('scenery-stage-facility-soundstage-12')
    expect(row.textContent).toContain('Graveyard')
    expect(within(row).getByTestId(`scenery-stage-state-facility-soundstage-12`).textContent).toBe(
      'Standing',
    )
  })
})
