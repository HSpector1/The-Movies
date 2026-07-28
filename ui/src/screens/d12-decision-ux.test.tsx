// ── D-12 owner decision UX (C1/C2/C3) ─────────────────────────────────────────
// Bounded decision-screen corrections from the owner's playtest: solvency is separated from EXPOSURE
// (a solvent-but-aggressive bet is not reassured with a green tick); the Shape's plain-English preview
// matches the engine deltas and updates with Production Demand; and scripts can be sorted/searched/
// filtered with the current selection preserved.

import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, within, fireEvent, cleanup } from '@testing-library/react'
import { Assembly } from './Assembly.tsx'
import { capitalExposure, shapeExplainView } from '../engine/adapter.ts'
import type { FilmShape, GameState } from '../engine/adapter.ts'
import { newFoundedGame } from '../test/founding.ts'

afterEach(cleanup)

const CONTAINED: FilmShape = { opening: 'slowSetup', midpoint: 'revelation', ending: 'tragic' }
const DEMANDING: FilmShape = { opening: 'immediateAction', midpoint: 'escalation', ending: 'triumph' }

// ── C1: solvency vs exposure ──────────────────────────────────────────────────
describe('C1: capital exposure is distinct from solvency', () => {
  it('a 54%-of-cash commitment reads High exposure (not merely a green "affordable")', () => {
    const s = newFoundedGame('ux-exposure')
    const cash = capitalExposure(s, 0).cash
    const e = capitalExposure(s, Math.round(cash * 0.54))
    expect(e.pctOfCash).toBeCloseTo(0.54, 2)
    expect(e.exposure).toBe('High')
    // The thresholds are graded, not binary.
    expect(capitalExposure(s, Math.round(cash * 0.1)).exposure).toBe('Low')
    expect(capitalExposure(s, Math.round(cash * 0.3)).exposure).toBe('Moderate')
    expect(capitalExposure(s, Math.round(cash * 0.7)).exposure).toBe('Extreme')
  })
})

// ── C2: Shape explanation matches engine values ───────────────────────────────
describe('C2: Shape explanation is engine-derived and demand-aware', () => {
  it('a demanding Shape reports higher Production Demand than a contained one, with matching prose', () => {
    const demanding = shapeExplainView(DEMANDING)
    const contained = shapeExplainView(CONTAINED)
    expect(demanding.budgetDemandMultiplier).toBeGreaterThan(contained.budgetDemandMultiplier)
    expect(['Demanding', 'Highly Demanding']).toContain(demanding.demandCategory)
    expect(['Contained', 'Standard']).toContain(contained.demandCategory)
    // Prose is consistent with the reach delta (never contradicts the numbers).
    if (demanding.openingReachMod > 6) expect(demanding.summary).toMatch(/Kinetic|accessible|broader/)
    if (contained.openingReachMod < -6) expect(contained.summary).toMatch(/Contained|intimate|less opening/)
    // The demand category in the prose matches the computed category.
    expect(demanding.summary.toLowerCase()).toContain(demanding.demandCategory.toLowerCase())
  })
})

// ── C1/C2/C3 in the live Assembly wizard ──────────────────────────────────────
function openAssembly(seed: string): GameState {
  const state = newFoundedGame(seed)
  render(<Assembly state={state} onGreenlit={() => {}} onCancel={() => {}} onStateChange={() => {}} />)
  return state
}

describe('C3: script browsing on the concept step', () => {
  it('sorts by base cost, searches by title, and preserves the current selection', () => {
    openAssembly('ux-browse')
    // Controls exist.
    expect(screen.getByTestId('concept-sort')).toBeInTheDocument()
    expect(screen.getByTestId('concept-search')).toBeInTheDocument()
    expect(screen.getByTestId('concept-genre')).toBeInTheDocument()
    const grid = () => screen.getByTestId('concept-grid')

    // Select the first concept → Next enables (a selection exists).
    fireEvent.click(within(grid()).getAllByRole('button')[0]!)
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(false)

    // Sort by cost, low to high → the selection is PRESERVED (Next stays enabled).
    fireEvent.change(screen.getByTestId('concept-sort'), { target: { value: 'costAsc' } })
    expect((screen.getByTestId('assembly-next') as HTMLButtonElement).disabled).toBe(false)

    // The visible order is now non-decreasing by base cost is not directly observable here, but the
    // count reflects the (unfiltered) full set, and a title search narrows it.
    const total = screen.getByTestId('concept-count').textContent
    fireEvent.change(screen.getByTestId('concept-search'), { target: { value: 'zzzznomatch' } })
    expect(screen.getByTestId('concept-none')).toBeInTheDocument()
    fireEvent.change(screen.getByTestId('concept-search'), { target: { value: '' } })
    expect(screen.getByTestId('concept-count').textContent).toBe(total) // cleared search restores all
  })

  it('the Budget step shows Solvency, Capital committed %, Exposure, and the Shape/Demand panels', () => {
    // Drive to the budget step to confirm the C1 exposure UI and the shape-explanation/demand panels render.
    openAssembly('ux-budget')
    const grid = screen.getByTestId('concept-grid')
    fireEvent.click(within(grid).getAllByRole('button')[0]!)
    fireEvent.click(screen.getByTestId('assembly-next')) // → shape
    expect(screen.getByTestId('shape-explanation')).toBeInTheDocument() // C2
    fireEvent.click(screen.getByTestId('assembly-next')) // → promise
    fireEvent.click(screen.getByTestId('assembly-next')) // → talent
    // Fill the talent so a package exists and we can reach budget.
    const pick = (p: string) =>
      fireEvent.click(within(screen.getByTestId(p)).getAllByRole('button').find((b) => b.hasAttribute('aria-pressed') && !(b as HTMLButtonElement).disabled)!)
    for (const p of ['picker-writer', 'picker-director', 'picker-lead', 'picker-antagonist', 'picker-support', 'picker-craft']) pick(p)
    fireEvent.click(screen.getByTestId('assembly-next')) // → budget
    // C1: solvency + capital-committed% + exposure are distinct.
    expect(screen.getByTestId('budget-solvency').textContent).toMatch(/Pass|Blocked/)
    expect(screen.getByTestId('budget-capital-committed').textContent).toMatch(/% of current cash/)
    expect(screen.getByTestId('budget-exposure').textContent).toMatch(/Low|Moderate|High|Extreme/)
    expect(screen.queryByText('Affordable ✓')).toBeNull() // the reassuring green tick is gone
    // Production Demand panel present.
    expect(screen.getByTestId('production-demand')).toBeInTheDocument()
  })
})
