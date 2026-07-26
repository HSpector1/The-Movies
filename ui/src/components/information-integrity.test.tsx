// ── INDEPENDENT information-integrity suite (highest priority) ────────────────
// Governing rule (Phase-5 authorization / contract §2.2, §5.6, §7, §10):
//   • The player is NEVER shown a talent's hidden `actual` persona values —
//     only `perceived`.
//   • Oracle-only info (expected value) is never shown; realized quality
//     (critic score / box office) is not shown before release.
//   • The stored `forecastSnapshot` is displayed UNCHANGED for active/released
//     productions (not recomputed with post-greenlight info).
//   • Restricted-mode Concept and Forecast components hide precise values.
//
// These expectations are DERIVED FROM ENGINE TRUTH: we call generateWorld(seed)
// in the test to compute the forbidden `actual` values, then assert they are not
// in the DOM. We do NOT trust the adapter's projection — we render the real UI.

import { describe, it, expect } from 'vitest'
import { render, screen, within, cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'
import { generateWorld } from '../../../src/core/index.ts'
import type { Talent as CoreTalent } from '../../../src/core/index.ts'
import { TalentPicker } from './TalentPicker.tsx'
import { ConceptCard } from './ConceptCard.tsx'
import { ForecastDisplay } from './ForecastDisplay.tsx'
import { Dashboard } from '../screens/Dashboard.tsx'
import {
  newGame,
  talentByRole,
  previewForecast,
  requiredNegative,
  greenlight,
  toPlayerVisible,
} from '../engine/adapter.ts'
import { newFoundedGame, foundedRosterIds } from '../test/founding.ts'
import type { DraftPackage, GameState } from '../engine/adapter.ts'
import { axis, money } from '../format.ts'

afterEach(cleanup)

// The UI renders perceived persona axes via `axis()` = n.toFixed(2). To assert the
// hidden `actual` value is NOT shown, format it the SAME way the UI would if it
// (wrongly) leaked, and search the DOM text for that string.
function formattedAxes(p: { warmth: number; gravity: number; physicality: number }): string[] {
  return [axis(p.warmth), axis(p.gravity), axis(p.physicality)]
}

// Build a legal package from the FOUNDED studio roster. Under D-11.12 film assembly
// draws ONLY from studio-contracted talent (the global pool is no longer staffable),
// and D-11.13 requires exactly ONE Production/Craft Lead — so we pick roster ids by
// role and fill the craft slot.
function legalPackage(state: GameState): DraftPackage {
  const concept = state.concepts[0]!
  const writers = foundedRosterIds(state, 'writer')
  const directors = foundedRosterIds(state, 'director')
  const actors = foundedRosterIds(state, 'actor')
  const craft = foundedRosterIds(state, 'craft')
  const shape = { opening: 'slowSetup', midpoint: 'reversal', ending: 'bittersweet' } as const
  return {
    conceptId: concept.id,
    shape,
    promise: {
      genre: concept.genre,
      intendedSegments: ['adult'],
      ranges: { intimacy: [-0.4, 0.4], tonalWeight: [-0.4, 0.4], kineticEnergy: [-0.4, 0.4] },
    },
    writerId: writers[0]!,
    directorId: directors[0]!,
    craftIds: [craft[0]!],
    cast: { lead: actors[0]!, antagonist: actors[1]!, support: actors[2]! },
    budget: { negative: requiredNegative(concept, shape, state), marketing: 400_000 },
  }
}

// A talent whose actual persona is meaningfully DIFFERENT from perceived (worldgen
// adds normal(0,0.25) noise then clamps — many will differ). We pick one where at
// least one axis differs at 2-decimal resolution, so the forbidden value is a
// distinct, searchable string that isn't coincidentally the perceived one.
function findDivergentActor(state: GameState): CoreTalent {
  const actors = state.talent.filter((t) => t.role === 'actor')
  const divergent = actors.find((t) => {
    const a = formattedAxes(t.actual)
    const p = formattedAxes(t.perceived)
    return a.some((v, i) => v !== p[i])
  })
  return divergent ?? actors[0]!
}

describe('information integrity: actual persona is NEVER rendered', () => {
  it('TalentPicker renders perceived axes and never the hidden actual axes', () => {
    const seed = 'ii-actual-1'
    const state = newGame(seed)
    // Engine truth: recompute the world independently to get `actual`.
    const truthWorld = generateWorld(seed)
    const actor = findDivergentActor(truthWorld)

    const pool = talentByRole(state, 'actor')
    render(
      <TalentPicker
        title="Lead"
        pool={pool}
        role="actor"
        selectedId={null}
        chosenElsewhere={[]}
        onSelect={() => {}}
        testid="picker-lead"
      />,
    )

    const card = screen.getByTestId(`talent-${actor.id}`)
    const text = card.textContent ?? ''

    // The PERCEIVED axes ARE shown (that's the public belief).
    for (const v of formattedAxes(actor.perceived)) {
      expect(text).toContain(v)
    }

    // The HIDDEN actual axes, where they differ from perceived, must NOT appear.
    const actualAxes = formattedAxes(actor.actual)
    const perceivedAxes = formattedAxes(actor.perceived)
    const leakedOnly = actualAxes.filter((v, i) => v !== perceivedAxes[i])
    // At least one axis genuinely diverges (the fixture guarantees it via
    // findDivergentActor); assert every such distinct actual value is absent.
    expect(leakedOnly.length).toBeGreaterThan(0)
    for (const forbidden of leakedOnly) {
      expect(text).not.toContain(forbidden)
    }
  })

  it('the whole talent pool never leaks any actual axis that differs from perceived', () => {
    const seed = 'ii-actual-2'
    const state = newGame(seed)
    const truthWorld = generateWorld(seed)
    const pool = talentByRole(state, 'actor')
    render(
      <TalentPicker
        title="Lead"
        pool={pool}
        role="actor"
        selectedId={null}
        chosenElsewhere={[]}
        onSelect={() => {}}
        testid="picker-pool"
      />,
    )
    const container = screen.getByTestId('picker-pool')
    const domText = container.textContent ?? ''

    for (const t of truthWorld.talent.filter((x) => x.role === 'actor')) {
      const actualAxes = formattedAxes(t.actual)
      const perceivedAxes = formattedAxes(t.perceived)
      for (let i = 0; i < 3; i++) {
        if (actualAxes[i] !== perceivedAxes[i]) {
          // A distinct hidden value — must not be findable inside this card's text.
          const card = within(container).queryByTestId(`talent-${t.id}`)
          if (card) {
            expect(card.textContent ?? '').not.toContain(actualAxes[i])
          }
        }
      }
      // Regardless, perceived values are present for the whole pool.
      const card = within(container).queryByTestId(`talent-${t.id}`)
      if (card) {
        for (const v of perceivedAxes) expect(card.textContent ?? '').toContain(v)
      }
    }
    // Sanity: the rendered pool used perceived (label present), never "actual".
    expect(domText.toLowerCase()).not.toContain('actual')
  })

  it('the projected player-visible talent object carries no `actual` field at all', () => {
    const state = newGame('ii-actual-3')
    for (const t of talentByRole(state, 'writer')) {
      expect((t as Record<string, unknown>).actual).toBeUndefined()
      expect(t.perceived).toBeDefined()
    }
    // And the projection helper does not copy actual through.
    const raw = generateWorld('ii-actual-3').talent[0]!
    const visible = toPlayerVisible(raw, new Map())
    expect((visible as Record<string, unknown>).actual).toBeUndefined()
  })
})

describe('information integrity: no Oracle expected-value, no realized quality pre-release', () => {
  it('the pre-greenlight forecast is labeled an ESTIMATE and shows no realized critic score', () => {
    const state = newFoundedGame('ii-oracle-1')
    const forecast = previewForecast(state, legalPackage(state))
    render(<ForecastDisplay forecast={forecast} mode="normal" source="estimate" />)
    const display = screen.getByTestId('forecast-display')
    // Marked as an ESTIMATE (an .tag.estimate chip), and NOT as a result:
    expect(display.querySelector('.tag.estimate')).not.toBeNull()
    // No result-tagged element is present (the film has not released).
    expect(display.querySelector('.tag.result')).toBeNull()
    // The copy frames it as a prediction, not a result.
    expect(display.textContent ?? '').toMatch(/prediction|estimate/i)
    // The three headline figures are the FORECAST fields — the expected values —
    // not any realized/Oracle score. Each equals the forecast's own field.
    expect(screen.getByTestId('fc-critic').textContent ?? '').toContain(
      forecast.expectedCriticScore.toFixed(1),
    )
    expect(screen.getByTestId('fc-opening')).toBeInTheDocument()
  })

  it('an active (un-released) production on the dashboard shows only the ESTIMATE, never a realized result', () => {
    let state = newFoundedGame('ii-oracle-2')
    const g = greenlight(state, legalPackage(state))
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next

    render(
      <Dashboard
        state={state}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    // The active production card carries an "Est" marker on its forecast figures.
    const activeList = screen.getByTestId('active-list')
    expect(within(activeList).getAllByText(/Est/).length).toBeGreaterThan(0)
    // No realized critic score / box office is presented for the in-production film:
    // the "Recent releases" section is empty because nothing has released.
    expect(screen.getByTestId('no-releases')).toBeInTheDocument()
  })
})

describe('information integrity: displayed forecast equals the STORED snapshot (not a recompute)', () => {
  it('after greenlight the dashboard shows the greenlit forecastSnapshot exactly', () => {
    let state = newFoundedGame('ii-snapshot-1')
    const pkg = legalPackage(state)
    // What the studio predicted at greenlight (deterministic preview == stored).
    const preview = previewForecast(state, pkg)
    const g = greenlight(state, pkg)
    expect(g.ok).toBe(true)
    if (!g.ok) return
    state = g.next
    const prod = state.studio.activeProductions[0]!
    // Contract: the stored snapshot IS the preview (byte-equal), not a recompute.
    expect(prod.forecastSnapshot).toEqual(preview)

    render(
      <Dashboard
        state={state}
        onAssemble={() => {}}
        onAdvance={() => {}}
        onCreateTalent={() => {}}
        onSaves={() => {}}
        onOpenAutopsy={() => {}}
      />,
    )
    // The dashboard renders the STORED snapshot's expectedTotal (money-formatted).
    const activeCard = screen.getByTestId(`active-${prod.id}`)
    expect(activeCard.textContent ?? '').toContain(money(prod.forecastSnapshot.expectedTotal))
  })
})

describe('information integrity: restricted mode hides the PRECISE values normal mode shows', () => {
  it('ConceptCard restricted omits the exact base-cost string that normal renders (mutation-grade)', () => {
    const state = newGame('ii-restr-concept')
    const concept = state.concepts[0]!
    const exactCost = money(concept.baseNegativeCost)

    const { unmount } = render(<ConceptCard concept={concept} mode="normal" />)
    const normalText = screen.getByTestId('concept-cost-exact').textContent ?? ''
    expect(normalText).toContain(exactCost)
    unmount()

    render(<ConceptCard concept={concept} mode="restricted" />)
    // The exact money string is GONE; only a qualitative band remains.
    expect(screen.queryByTestId('concept-cost-exact')).toBeNull()
    const band = screen.getByTestId('concept-cost-band')
    expect(band.textContent ?? '').not.toContain(exactCost)
    expect(band.textContent ?? '').toMatch(/Modest|Substantial|Major/)
  })

  it('ForecastDisplay restricted omits the exact expected-total money that normal renders (mutation-grade)', () => {
    const state = newFoundedGame('ii-restr-forecast')
    const forecast = previewForecast(state, legalPackage(state))
    const exactTotal = money(forecast.expectedTotal)
    const exactOpening = money(forecast.expectedOpening)

    const { unmount } = render(<ForecastDisplay forecast={forecast} mode="normal" />)
    expect((screen.getByTestId('fc-total').textContent ?? '')).toBe(exactTotal)
    expect((screen.getByTestId('fc-opening').textContent ?? '')).toBe(exactOpening)
    // Normal mode per-segment row has 4 cells (Segment, Band, Estimate, Range).
    expect(within(screen.getByTestId('fc-seg-youngAdult')).getAllByRole('cell').length).toBe(4)
    unmount()

    render(<ForecastDisplay forecast={forecast} mode="restricted" />)
    // The exact dollar figures are ABSENT — replaced by qualitative buckets.
    const rTotal = screen.getByTestId('fc-total').textContent ?? ''
    const rOpening = screen.getByTestId('fc-opening').textContent ?? ''
    expect(rTotal).not.toBe(exactTotal)
    expect(rTotal).not.toMatch(/\$/)
    expect(rOpening).not.toMatch(/\$/)
    expect(['Small', 'Moderate', 'Large']).toContain(rTotal.trim())
    // Restricted drops the precise per-segment estimate column (3 cells, not 4).
    expect(within(screen.getByTestId('fc-seg-youngAdult')).getAllByRole('cell').length).toBe(3)
  })
})
